import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { BlsWorkflowTask } from '../../database/entities/bls-workflow-task.entity';
import { BLS_SECRET_PURPOSE, BlsSecretVaultService } from '../../bls-secrets';
import { BLS_WORKFLOW_ERROR_CLASS } from '../../bls-workflow/constants/bls-workflow.constants';
import {
  listApplicationClientApplicantIds,
  PortalConfigService,
} from '../../portal-core';
import {
  createInitialPortalBookingCheckpoint,
  loadPortalBookingCheckpoint,
  mergePortalBookingCheckpoint,
  PortalBookingFillService,
  savePortalBookingCheckpoint,
  type PortalBookingCheckpoint,
  type PortalBookingCheckpointPatch,
} from '../../portal-fill';
import {
  BLS_BOOKING_MISSING_EMAIL_ERROR_MESSAGE,
  BLS_BOOKING_MISSING_PASSWORD_ERROR_MESSAGE,
  BLS_BOOKING_NOT_SAFE_ERROR_CODE,
  BLS_BOOKING_NOT_SAFE_ERROR_MESSAGE,
  BLS_BOOKING_PIPELINE_ERROR_CODE,
  BLS_BOOKING_UI_NOT_OPEN_ERROR_CODE,
  BLS_BOOKING_UI_NOT_OPEN_ERROR_MESSAGE,
  PROXY_PROVIDER,
} from '../constants';
import type { BlsBookingClient, ProxyProvider } from '../interfaces';
import type { BlsClientResult, BlsClientTaskContext } from '../types';
import type { ProxyProviderLease } from '../types';
import { buildBlsClientAbortResult } from '../utils/build-bls-client-abort-result.util';
import { buildPortalBookingPrefillHint } from '../utils/build-portal-booking-prefill-hint.util';

/**
 * BOOK domain client (REQ-001…017 / DEC-001 / DEC-002 / DEC-004 / DEC-008 /
 * OQ-007 / VT-TASK-007…010).
 * Email DP consent → booking UI → Attention → extended fill → VisaType
 * Submit → captcha → slots SAFE_TO_REPEAT or UNKNOWN_NEXT →
 * AWAITING_STAFF_BOOKING. Never open-UI-only BOOK success (DEC-004). Never
 * Premium Accept / payment (CON-004). Domain client ≠ orchestrator (NFR-004).
 */
@Injectable()
export class BlsBookingClientService implements BlsBookingClient {
  private readonly logger = new Logger(BlsBookingClientService.name);

  constructor(
    private readonly configService: PortalConfigService,
    private readonly fillService: PortalBookingFillService,
    private readonly secretVault: BlsSecretVaultService,
    @Inject(PROXY_PROVIDER)
    private readonly proxyProvider: ProxyProvider,
    @InjectRepository(Application)
    private readonly appsRepo: Repository<Application>,
    @InjectRepository(BlsWorkflowTask)
    private readonly tasksRepo: Repository<BlsWorkflowTask>,
  ) {}

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    const { workflowId, applicationId, attemptNo } = context;
    this.logger.log(
      `bls_booking_client start workflowId=${workflowId} taskKey=${context.taskKey} attemptNo=${attemptNo}`,
    );

    let lease: ProxyProviderLease | undefined;
    let portalPasswordPlain: string | undefined;
    let mailboxTokenPlain: string | undefined;

    try {
      if (context.abortSignal?.aborted) {
        return buildBlsClientAbortResult();
      }

      const app = await this.appsRepo.findOne({
        where: { id: applicationId },
      });
      if (!app) {
        return this.safeFail(
          BLS_BOOKING_PIPELINE_ERROR_CODE,
          'Application not found',
        );
      }

      const portalFormEmail = app.portalFormEmail?.trim() ?? '';
      if (!portalFormEmail) {
        return this.safeFail(
          BLS_BOOKING_PIPELINE_ERROR_CODE,
          BLS_BOOKING_MISSING_EMAIL_ERROR_MESSAGE,
        );
      }

      const loadedPassword = await this.secretVault.loadSecretPlain({
        workflowId,
        purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
      });
      portalPasswordPlain = loadedPassword ?? undefined;
      if (!portalPasswordPlain?.trim()) {
        return this.safeFail(
          BLS_BOOKING_PIPELINE_ERROR_CODE,
          BLS_BOOKING_MISSING_PASSWORD_ERROR_MESSAGE,
        );
      }

      const config = await this.configService.load();
      if (!config.portalBaseUrl?.trim()) {
        return this.safeFail(
          BLS_BOOKING_PIPELINE_ERROR_CODE,
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
          BLS_BOOKING_PIPELINE_ERROR_CODE,
          err instanceof Error ? err.message : 'Invalid portal URL',
        );
      }

      if (config.proxyMisconfigured) {
        return this.safeFail(
          BLS_BOOKING_PIPELINE_ERROR_CODE,
          'Proxy provider misconfigured',
        );
      }

      if (config.proxyEnabled) {
        lease = await this.proxyProvider.acquire(config);
      }

      if (context.abortSignal?.aborted) {
        return buildBlsClientAbortResult();
      }

      const loadedCheckpoint = await loadPortalBookingCheckpoint(
        this.tasksRepo,
        context.taskId,
      );
      let checkpointState: PortalBookingCheckpoint =
        loadedCheckpoint.checkpoint ?? createInitialPortalBookingCheckpoint();

      const onCheckpoint = async (
        patch: PortalBookingCheckpointPatch,
      ): Promise<void> => {
        checkpointState = mergePortalBookingCheckpoint(checkpointState, patch);
        await savePortalBookingCheckpoint(this.tasksRepo, {
          taskId: context.taskId,
          checkpoint: checkpointState,
        });
      };

      // Vaulted MAILBOX_TOKEN when present (HTTP retain); empty for browser-mail.
      const loadedMailboxToken = await this.secretVault.loadSecretPlain({
        workflowId,
        purpose: BLS_SECRET_PURPOSE.MAILBOX_TOKEN,
      });
      mailboxTokenPlain = loadedMailboxToken ?? '';

      const applicantIds = listApplicationClientApplicantIds(app.clientId);
      const headed = this.configService.resolveHeaded();
      const fill = await this.fillService.fillBookingContinue({
        loginUrl,
        homeUrl,
        manageApplicantsUrl,
        portalFormEmail,
        portalPassword: portalPasswordPlain,
        prefill: buildPortalBookingPrefillHint(app, applicantIds.length),
        headed,
        captchaServiceApiKey: config.captchaServiceApiKey,
        browserProxy: lease?.browserProxy,
        applicationId,
        abortSignal: context.abortSignal,
        mailbox: {
          contextKey: workflowId,
          token: mailboxTokenPlain,
          restoreAddress: portalFormEmail,
        },
        priorCheckpoint: checkpointState,
        onCheckpoint,
        onBrowserLaunched: context.registerCloseHook
          ? (close): void => {
              const registerCloseHook = context.registerCloseHook;
              if (registerCloseHook) {
                registerCloseHook(close);
              }
            }
          : undefined,
      });

      portalPasswordPlain = undefined;
      mailboxTokenPlain = undefined;

      if (fill.aborted === true || context.abortSignal?.aborted) {
        return buildBlsClientAbortResult();
      }

      if (fill.notSafeToRepeat === true) {
        // Mid-booking staff gate (Premium/payment/ambiguous) → WAITING_STAFF.
        // Do not complete BOOK / schedule terminal mailbox cleanup (DEC-004).
        this.logger.warn(
          `bls_booking_client not_safe workflowId=${workflowId} (CON-004/DEC-001/DEC-004)`,
        );
        return {
          ok: false,
          errorClass: BLS_WORKFLOW_ERROR_CLASS.NOT_SAFE_TO_REPEAT,
          errorCode:
            fill.errorCode?.trim() || BLS_BOOKING_NOT_SAFE_ERROR_CODE,
          errorMessage:
            fill.error?.slice(0, 500) ?? BLS_BOOKING_NOT_SAFE_ERROR_MESSAGE,
        };
      }

      if (fill.errorCode?.trim()) {
        // Includes slots-unavailable SAFE_TO_REPEAT — no terminal cleanup.
        return this.safeFail(
          fill.errorCode.trim(),
          fill.error?.slice(0, 500) ?? 'Booking continue fill failed',
        );
      }

      // DEC-004 / OQ-007: only materials-covered unknown-next completes BOOK →
      // AWAITING_STAFF_BOOKING (SPA handoff). Not open-UI / prefill-only.
      if (fill.navigationOk && fill.unknownNext === true) {
        this.logger.log(
          `bls_booking_client success workflowId=${workflowId} unknownNext=true staff_terminal`,
        );
        return { ok: true, verifiedExternalState: true };
      }

      if (fill.navigationOk && fill.bookingSelectionUiOpen !== true) {
        return {
          ok: false,
          errorClass: BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT,
          errorCode: BLS_BOOKING_UI_NOT_OPEN_ERROR_CODE,
          errorMessage:
            fill.error?.slice(0, 500) ?? BLS_BOOKING_UI_NOT_OPEN_ERROR_MESSAGE,
        };
      }

      return this.safeFail(
        BLS_BOOKING_PIPELINE_ERROR_CODE,
        fill.error?.slice(0, 500) ?? 'Booking continue fill failed',
      );
    } catch (err) {
      if (context.abortSignal?.aborted) {
        return buildBlsClientAbortResult();
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `bls_booking_client unexpected failure workflowId=${workflowId} ${message}`,
      );
      return this.safeFail(
        BLS_BOOKING_PIPELINE_ERROR_CODE,
        message.slice(0, 500),
      );
    } finally {
      portalPasswordPlain = undefined;
      mailboxTokenPlain = undefined;
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
