import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { BLS_SECRET_PURPOSE, BlsSecretVaultService } from '../../bls-secrets';
import { BLS_WORKFLOW_ERROR_CLASS } from '../../bls-workflow/constants/bls-workflow.constants';
import {
  listApplicationApplicantIds,
  PortalConfigService,
} from '../../portal-core';
import { PortalBookingFillService } from '../../portal-fill';
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

/**
 * BOOK domain client (REQ-020 / REQ-030 / CON-006 / DEC-010 / DEC-011 / TASK-012).
 * Opens booking selection UI, optional unambiguous CRM prefill, then stops for
 * staff. Never clicks VisaType `#btnSubmit` / OnSubmitVisaType, Premium Lounge
 * Accept, or payment. Runner advance → AWAITING_STAFF_BOOKING.
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
  ) {}

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    const { workflowId, applicationId, attemptNo } = context;
    this.logger.log(
      `bls_booking_client start workflowId=${workflowId} taskKey=${context.taskKey} attemptNo=${attemptNo}`,
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
      let manageApplicantsUrl: string;
      try {
        loginUrl = this.configService.resolvePortalLoginUrl(config);
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

      const applicantIds = listApplicationApplicantIds(app.applicants);
      const headed = this.configService.resolveHeaded();
      const fill = await this.fillService.fillBookingSafeStop({
        loginUrl,
        manageApplicantsUrl,
        portalFormEmail,
        portalPassword: portalPasswordPlain,
        prefill: {
          submitCity: app.submitCity?.trim() || undefined,
          visaType: app.visaType?.trim() || undefined,
          applicantCount: applicantIds.length,
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

      if (fill.errorCode?.trim()) {
        return this.safeFail(
          fill.errorCode.trim(),
          fill.error?.slice(0, 500) ?? 'Booking safe-stop fill failed',
        );
      }

      if (fill.notSafeToRepeat === true) {
        this.logger.warn(
          `bls_booking_client not_safe workflowId=${workflowId} (CON-006)`,
        );
        return {
          ok: false,
          errorClass: BLS_WORKFLOW_ERROR_CLASS.NOT_SAFE_TO_REPEAT,
          errorCode: BLS_BOOKING_NOT_SAFE_ERROR_CODE,
          errorMessage:
            fill.error?.slice(0, 500) ?? BLS_BOOKING_NOT_SAFE_ERROR_MESSAGE,
        };
      }

      if (fill.navigationOk && fill.bookingSelectionUiOpen === true) {
        this.logger.log(
          `bls_booking_client success workflowId=${workflowId} bookingSelectionUiOpen=true ambiguousPrefill=${fill.prefill?.ambiguous === true}`,
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
        fill.error?.slice(0, 500) ?? 'Booking safe-stop fill failed',
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
