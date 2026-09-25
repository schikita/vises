import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { BLS_SECRET_PURPOSE, BlsSecretVaultService } from '../../bls-secrets';
import { BLS_WORKFLOW_ERROR_CLASS } from '../../bls-workflow/constants/bls-workflow.constants';
import {
  findApplicant,
  listApplicationApplicantIds,
  PortalConfigService,
  type ApplicantInput,
  type ApplicationInput,
} from '../../portal-core';
import {
  BLS_APPLICANT_PORTAL_STATUS,
  PortalStatusFillService,
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

      const applicantIds = listApplicationApplicantIds(app.applicants);
      const applicantId =
        context.applicantId?.trim() || applicantIds[0] || '';
      if (!applicantId) {
        return this.safeFail(
          BLS_STATUS_MISSING_APPLICANT_ERROR_CODE,
          BLS_STATUS_MISSING_APPLICANT_ERROR_MESSAGE,
        );
      }

      const applicationInput: ApplicationInput = {
        id: app.id,
        applicants: Array.isArray(app.applicants)
          ? (app.applicants as ApplicantInput[])
          : [],
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
      let manageApplicantsUrl: string;
      try {
        loginUrl = this.configService.resolvePortalLoginUrl(config);
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
      const fill = await this.fillService.fillStatusValidate({
        loginUrl,
        manageApplicantsUrl,
        portalFormEmail,
        portalPassword: portalPasswordPlain,
        applicant: {
          applicantId,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          ordinalIndex,
        },
        editFill: {
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          placeOfBirth: applicant.placeOfBirth,
          passportNumber: applicant.passportNumber,
        },
        headed,
        captchaServiceApiKey: config.captchaServiceApiKey,
        browserProxy: lease?.browserProxy,
        applicationId,
        abortSignal: context.abortSignal,
        onBrowserLaunched: context.registerCloseHook
          ? (close) => context.registerCloseHook!(close)
          : undefined,
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
        return this.safeFail(
          fill.errorCode.trim(),
          fill.error?.slice(0, 500) ?? 'Status validate fill failed',
        );
      }

      if (fill.submitAmbiguous === true) {
        return {
          ok: false,
          errorClass: BLS_WORKFLOW_ERROR_CLASS.VERIFY_THEN_REPEAT,
          errorCode: BLS_STATUS_SUBMIT_AMBIGUOUS_ERROR_CODE,
          errorMessage:
            fill.error?.slice(0, 500) ??
            BLS_STATUS_SUBMIT_AMBIGUOUS_ERROR_MESSAGE,
        };
      }

      if (fill.status === BLS_APPLICANT_PORTAL_STATUS.UNKNOWN) {
        return {
          ok: false,
          errorClass: BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT,
          errorCode: BLS_STATUS_UNKNOWN_ERROR_CODE,
          errorMessage:
            fill.error?.slice(0, 500) ?? BLS_STATUS_UNKNOWN_ERROR_MESSAGE,
        };
      }

      if (
        fill.status ===
          BLS_APPLICANT_PORTAL_STATUS.FORM_FILLING_IN_PROGRESS ||
        fill.readyToBook !== true
      ) {
        return {
          ok: false,
          errorClass: BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT,
          errorCode: BLS_STATUS_NOT_READY_ERROR_CODE,
          errorMessage:
            fill.error?.slice(0, 500) ?? BLS_STATUS_NOT_READY_ERROR_MESSAGE,
        };
      }

      return this.safeFail(
        BLS_STATUS_PIPELINE_ERROR_CODE,
        fill.error?.slice(0, 500) ?? 'Status validate fill failed',
      );
    } catch (err) {
      if (context.abortSignal?.aborted) {
        return buildBlsClientAbortResult();
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `bls_status_client unexpected failure workflowId=${workflowId} ${message}`,
      );
      return this.safeFail(
        BLS_STATUS_PIPELINE_ERROR_CODE,
        message.slice(0, 500),
      );
    } finally {
      portalPasswordPlain = undefined;
      if (lease) {
        await lease.release().catch(() => undefined);
      }
    }
  }

  private safeFail(errorCode: string, errorMessage: string): BlsClientResult {
    return {
      ok: false,
      errorClass: BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT,
      errorCode,
      errorMessage,
    };
  }
}
