import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { BlsWorkflowTask } from '../../database/entities/bls-workflow-task.entity';
import { Client } from '../../database/entities/client.entity';
import { BLS_SECRET_PURPOSE, BlsSecretVaultService } from '../../bls-secrets';
import {
  ClientPiiDecryptService,
  findApplicant,
  listApplicationClientApplicantIds,
  PortalConfigService,
  type ApplicationInput,
} from '../../portal-core';
import {
  BLS_APPLICANT_PORTAL_STATUS,
  buildEditMemberFillInput,
  createInitialPortalStatusCheckpoint,
  EDIT_MEMBER_FIELD_PLAN_ACTION,
  loadPortalStatusCheckpoint,
  mapApplicantInputToEditMemberCrmApplicant,
  mergePortalStatusCheckpoint,
  PortalStatusFillService,
  resolvePortalStatusAddFamilyMemberGate,
  savePortalStatusCheckpoint,
  type BlsApplicantPortalStatus,
  type PortalStatusCheckpoint,
  type PortalStatusCheckpointPatch,
} from '../../portal-fill';
import {
  BLS_STATUS_MISSING_APPLICANT_ERROR_CODE,
  BLS_STATUS_MISSING_APPLICANT_ERROR_MESSAGE,
  BLS_STATUS_MISSING_EMAIL_ERROR_MESSAGE,
  BLS_STATUS_MISSING_PASSWORD_ERROR_MESSAGE,
  BLS_STATUS_NOT_READY_ERROR_CODE,
  BLS_STATUS_NOT_READY_ERROR_MESSAGE,
  BLS_STATUS_PIPELINE_ERROR_CODE,
  BLS_STATUS_SUBMIT_AMBIGUOUS_ERROR_CODE,
  BLS_STATUS_SUBMIT_AMBIGUOUS_ERROR_MESSAGE,
  BLS_STATUS_UNKNOWN_ERROR_CODE,
  BLS_STATUS_UNKNOWN_ERROR_MESSAGE,
  PROXY_PROVIDER,
} from '../constants';
import type { BlsStatusClient, ProxyProvider } from '../interfaces';
import type { BlsClientResult, BlsClientTaskContext } from '../types';
import type { ProxyProviderLease } from '../types';
import { buildBlsClientAbortResult } from '../utils/build-bls-client-abort-result.util';
import { mapBlsStatusClientFailure } from '../utils/map-bls-status-client-failure.util';
import { sanitizeBlsStatusClientErrorMessage } from '../utils/sanitize-bls-status-client-error-message.util';

/**
 * STATUS_VALIDATE domain client (REQ-018 / REQ-019 / REQ-021 / TASK-011).
 * Per-applicant sequential scrape/normalize; edit+attention when
 * FORM_FILLING_IN_PROGRESS; success only on READY_TO_BOOK. UNKNOWN ≠ success.
 * BOOK is gated by sequential STATUS_APPLICANT tasks (default = all applicants).
 */
@Injectable()
export class BlsStatusClientService implements BlsStatusClient {
  private readonly logger = new Logger(BlsStatusClientService.name);

  constructor(
    private readonly configService: PortalConfigService,
    private readonly fillService: PortalStatusFillService,
    private readonly secretVault: BlsSecretVaultService,
    @Inject(PROXY_PROVIDER)
    private readonly proxyProvider: ProxyProvider,
    @InjectRepository(Application)
    private readonly appsRepo: Repository<Application>,
    @InjectRepository(Client)
    private readonly clientsRepo: Repository<Client>,
    @InjectRepository(BlsWorkflowTask)
    private readonly tasksRepo: Repository<BlsWorkflowTask>,
    private readonly clientPii: ClientPiiDecryptService,
  ) {}

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    const { workflowId, applicationId, attemptNo } = context;
    this.logger.log(
      `bls_status_client start workflowId=${workflowId} taskKey=${context.taskKey} applicantId=${context.applicantId ?? 'null'} attemptNo=${attemptNo}`,
    );

    let lease: ProxyProviderLease | undefined;
    let portalPasswordPlain: string | undefined;

    try {
      if (context.abortSignal?.aborted) {
        return buildBlsClientAbortResult();
      }

      const app = await this.appsRepo.findOne({
        where: { id: applicationId },
      });
      if (!app) {
        return this.safeFail(
          BLS_STATUS_PIPELINE_ERROR_CODE,
          'Application not found',
        );
      }

      const portalFormEmail = app.portalFormEmail?.trim() ?? '';
      if (!portalFormEmail) {
        return this.safeFail(
          BLS_STATUS_PIPELINE_ERROR_CODE,
          BLS_STATUS_MISSING_EMAIL_ERROR_MESSAGE,
        );
      }

      const applicantIds = listApplicationClientApplicantIds(app.clientId);
      const applicantId =
        context.applicantId?.trim() || applicantIds[0] || '';
      if (!applicantId) {
        return this.safeFail(
          BLS_STATUS_MISSING_APPLICANT_ERROR_CODE,
          BLS_STATUS_MISSING_APPLICANT_ERROR_MESSAGE,
        );
      }

      const client = app.clientId
        ? await this.clientsRepo.findOne({ where: { id: app.clientId } })
        : null;
      const applicants = this.clientPii.toApplicantList(client);
      const applicationInput: ApplicationInput = {
        id: app.id,
        applicants,
      };
      const applicant = findApplicant(applicationInput, applicantId);
      if (!applicant) {
        return this.safeFail(
          BLS_STATUS_MISSING_APPLICANT_ERROR_CODE,
          BLS_STATUS_MISSING_APPLICANT_ERROR_MESSAGE,
        );
      }

      const ordinalIndex = Math.max(
        0,
        applicantIds.findIndex((id) => id === applicantId),
      );

      const crmApplicantIds = applicants
        .map((row) => row.id.trim())
        .filter((id) => id.length > 0);
      const applicationPrimaryApplicantId =
        crmApplicantIds[0] ?? applicantIds[0] ?? applicantId;
      const familyGate = resolvePortalStatusAddFamilyMemberGate({
        crmApplicantIds,
        primaryApplicantId: applicationPrimaryApplicantId,
      });
      this.logger.log(
        `bls_status_client add_family_gate workflowId=${workflowId} applicantId=${applicantId} shouldAdd=${familyGate.shouldAddFamilyMembers} additional=${familyGate.preStartAdditionalMemberCount}`,
      );

      const loadedPassword = await this.secretVault.loadSecretPlain({
        workflowId,
        purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
      });
      portalPasswordPlain = loadedPassword ?? undefined;
      if (!portalPasswordPlain?.trim()) {
        return this.safeFail(
          BLS_STATUS_PIPELINE_ERROR_CODE,
          BLS_STATUS_MISSING_PASSWORD_ERROR_MESSAGE,
        );
      }

      const config = await this.configService.load();
      if (!config.portalBaseUrl?.trim()) {
        return this.safeFail(
          BLS_STATUS_PIPELINE_ERROR_CODE,
          'Portal address is not set (VISES_PORTAL_BASE_URL)',
        );
      }

      let loginUrl: string;
      let homeUrl: string;
      let manageApplicantsUrl: string;
      try {
        loginUrl = this.configService.resolvePortalLoginUrl(config);
        homeUrl = this.configService.resolvePortalHomeUrl(config);
        manageApplicantsUrl =
          this.configService.resolvePortalManageApplicantsUrl(config);
      } catch (err) {
        return this.safeFail(
          BLS_STATUS_PIPELINE_ERROR_CODE,
          err instanceof Error ? err.message : 'Invalid portal URL',
        );
      }

      if (config.proxyMisconfigured) {
        return this.safeFail(
          BLS_STATUS_PIPELINE_ERROR_CODE,
          'Proxy provider misconfigured',
        );
      }

      if (config.proxyEnabled) {
        lease = await this.proxyProvider.acquire(config);
      }

      if (context.abortSignal?.aborted) {
        return buildBlsClientAbortResult();
      }

      const headed = this.configService.resolveHeaded();
      const loadedCheckpoint = await loadPortalStatusCheckpoint(
        this.tasksRepo,
        context.taskId,
      );
      let checkpointState: PortalStatusCheckpoint =
        loadedCheckpoint.checkpoint ??
        createInitialPortalStatusCheckpoint({ applicantId });
      let portalStatusState: BlsApplicantPortalStatus | null =
        loadedCheckpoint.portalStatus;

      const onCheckpoint = async (
        patch: PortalStatusCheckpointPatch,
      ): Promise<void> => {
        checkpointState = {
          ...mergePortalStatusCheckpoint(checkpointState, patch),
          applicantId,
        };
        if (patch.portalStatus !== undefined) {
          portalStatusState = patch.portalStatus;
        }
        await savePortalStatusCheckpoint(this.tasksRepo, {
          taskId: context.taskId,
          checkpoint: checkpointState,
          ...(portalStatusState != null
            ? { portalStatus: portalStatusState }
            : {}),
        });
      };

      const editFill = buildEditMemberFillInput({
        applicant: mapApplicantInputToEditMemberCrmApplicant(applicant),
        application: {
          submitCity: app.submitCity,
          visaType: app.visaType,
          destination: app.destination,
          travelDate: app.travelDate,
          returnDate: app.returnDate,
        },
      });

      if (editFill.hasUnskippableGaps) {
        this.logger.warn(
          `bls_status_client editFill hasUnskippableGaps=true workflowId=${workflowId} applicantId=${applicantId} gapFieldIds=${editFill.fields
            .filter(
              (entry) =>
                entry.action === EDIT_MEMBER_FIELD_PLAN_ACTION.UNSKIPPABLE_GAP,
            )
            .map((entry) => entry.fieldId)
            .join(',')}`,
        );
      }
      if (editFill.nationalVisaVerifyFirst) {
        this.logger.log(
          `bls_status_client nationalVisaVerifyFirst=true workflowId=${workflowId} applicantId=${applicantId}`,
        );
      }

      const fill = await this.fillService.fillStatusValidate({
        loginUrl,
        homeUrl,
        manageApplicantsUrl,
        portalFormEmail,
        portalPassword: portalPasswordPlain,
        applicant: {
          applicantId,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          ordinalIndex,
        },
        editFill,
        headed,
        captchaServiceApiKey: config.captchaServiceApiKey,
        browserProxy: lease?.browserProxy,
        applicationId,
        abortSignal: context.abortSignal,
        onBrowserLaunched: context.registerCloseHook
          ? (close) => context.registerCloseHook!(close)
          : undefined,
        priorCheckpoint: loadedCheckpoint.checkpoint,
        onCheckpoint,
        crmApplicantIds,
        shouldAddFamilyMembers: familyGate.shouldAddFamilyMembers,
      });

      portalPasswordPlain = undefined;

      if (fill.aborted === true || context.abortSignal?.aborted) {
        return buildBlsClientAbortResult();
      }

      if (fill.navigationOk && fill.readyToBook === true) {
        this.logger.log(
          `bls_status_client success workflowId=${workflowId} applicantId=${applicantId} readyToBook=true`,
        );
        return { ok: true, verifiedExternalState: true };
      }

      if (fill.errorCode?.trim()) {
        return mapBlsStatusClientFailure({
          errorCode: fill.errorCode.trim(),
          errorMessage: sanitizeBlsStatusClientErrorMessage(
            fill.error ?? 'Status validate fill failed',
          ),
          submitAmbiguous: fill.submitAmbiguous === true,
        });
      }

      if (fill.submitAmbiguous === true) {
        return mapBlsStatusClientFailure({
          errorCode: BLS_STATUS_SUBMIT_AMBIGUOUS_ERROR_CODE,
          errorMessage: sanitizeBlsStatusClientErrorMessage(
            fill.error ?? BLS_STATUS_SUBMIT_AMBIGUOUS_ERROR_MESSAGE,
          ),
          submitAmbiguous: true,
        });
      }

      // REQ-004 / NFR: UNKNOWN never success — prefer existing bls_status_unknown.
      if (fill.status === BLS_APPLICANT_PORTAL_STATUS.UNKNOWN) {
        return mapBlsStatusClientFailure({
          errorCode: BLS_STATUS_UNKNOWN_ERROR_CODE,
          errorMessage: sanitizeBlsStatusClientErrorMessage(
            fill.error ?? BLS_STATUS_UNKNOWN_ERROR_MESSAGE,
          ),
        });
      }

      if (
        fill.status ===
          BLS_APPLICANT_PORTAL_STATUS.FORM_FILLING_IN_PROGRESS ||
        fill.readyToBook !== true
      ) {
        return mapBlsStatusClientFailure({
          errorCode: BLS_STATUS_NOT_READY_ERROR_CODE,
          errorMessage: sanitizeBlsStatusClientErrorMessage(
            fill.error ?? BLS_STATUS_NOT_READY_ERROR_MESSAGE,
          ),
        });
      }

      return mapBlsStatusClientFailure({
        errorCode: BLS_STATUS_PIPELINE_ERROR_CODE,
        errorMessage: sanitizeBlsStatusClientErrorMessage(
          fill.error ?? 'Status validate fill failed',
        ),
      });
    } catch (err) {
      if (context.abortSignal?.aborted) {
        return buildBlsClientAbortResult();
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `bls_status_client unexpected failure workflowId=${workflowId} ${message}`,
      );
      return mapBlsStatusClientFailure({
        errorCode: BLS_STATUS_PIPELINE_ERROR_CODE,
        errorMessage: sanitizeBlsStatusClientErrorMessage(message),
      });
    } finally {
      portalPasswordPlain = undefined;
      if (lease) {
        await lease.release().catch(() => undefined);
      }
    }
  }

  private safeFail(errorCode: string, errorMessage: string): BlsClientResult {
    return mapBlsStatusClientFailure({
      errorCode,
      errorMessage: sanitizeBlsStatusClientErrorMessage(errorMessage),
    });
  }
}
