import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { BLS_SECRET_PURPOSE, BlsSecretVaultService, generatePortalPassword } from '../../bls-secrets';
import { BLS_WORKFLOW_ERROR_CLASS } from '../../bls-workflow/constants/bls-workflow.constants';
import { PortalConfigService } from '../../portal-core';
import { PortalPasswordChangeFillService } from '../../portal-fill';
import {
  BLS_PASSWORD_CHANGE_MISSING_EMAIL_ERROR_MESSAGE,
  BLS_PASSWORD_CHANGE_MISSING_PASSWORD_ERROR_MESSAGE,
  BLS_PASSWORD_CHANGE_PIPELINE_ERROR_CODE,
  BLS_PASSWORD_CHANGE_SKIP_REASON_NOT_PRESENTED,
  BLS_PASSWORD_CHANGE_SUBMIT_AMBIGUOUS_ERROR_CODE,
  BLS_PASSWORD_CHANGE_SUBMIT_AMBIGUOUS_ERROR_MESSAGE,
  PROXY_PROVIDER,
} from '../constants';
import type { BlsPasswordChangeClient, ProxyProvider } from '../interfaces';
import type { BlsClientResult, BlsClientTaskContext } from '../types';
import type { ProxyProviderLease } from '../types';
import { buildBlsClientAbortResult } from '../utils/build-bls-client-abort-result.util';

/**
 * PASSWORD_CHANGE domain client (REQ-012 / REQ-013 / REQ-014 / TASK-010).
 * Detect forced-change UI after login; generate compliant password; set it;
 * rotate vault PORTAL_PASSWORD only (keeps PORTAL_PASSWORD_INITIAL). If UI
 * absent → skip signal for orchestrator. Never hash; never log secrets.
 */
@Injectable()
export class BlsPasswordChangeClientService implements BlsPasswordChangeClient {
  private readonly logger = new Logger(BlsPasswordChangeClientService.name);

  constructor(
    private readonly configService: PortalConfigService,
    private readonly fillService: PortalPasswordChangeFillService,
    private readonly secretVault: BlsSecretVaultService,
    @Inject(PROXY_PROVIDER)
    private readonly proxyProvider: ProxyProvider,
    @InjectRepository(Application)
    private readonly appsRepo: Repository<Application>,
  ) {}

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    const { workflowId, applicationId, attemptNo } = context;
    this.logger.log(
      `bls_password_change_client start workflowId=${workflowId} taskKey=${context.taskKey} attemptNo=${attemptNo}`,
    );

    let lease: ProxyProviderLease | undefined;
    let currentPasswordPlain: string | undefined;
    let newPasswordPlain: string | undefined;

    try {
      if (context.abortSignal?.aborted) {
        return buildBlsClientAbortResult();
      }

      const app = await this.appsRepo.findOne({
        where: { id: applicationId },
      });
      if (!app) {
        return this.safeFail(
          BLS_PASSWORD_CHANGE_PIPELINE_ERROR_CODE,
          'Application not found',
        );
      }

      const portalFormEmail = app.portalFormEmail?.trim() ?? '';
      if (!portalFormEmail) {
        return this.safeFail(
          BLS_PASSWORD_CHANGE_PIPELINE_ERROR_CODE,
          BLS_PASSWORD_CHANGE_MISSING_EMAIL_ERROR_MESSAGE,
        );
      }

      const loadedPassword = await this.secretVault.loadSecretPlain({
        workflowId,
        purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
      });
      currentPasswordPlain = loadedPassword ?? undefined;
      if (!currentPasswordPlain?.trim()) {
        return this.safeFail(
          BLS_PASSWORD_CHANGE_PIPELINE_ERROR_CODE,
          BLS_PASSWORD_CHANGE_MISSING_PASSWORD_ERROR_MESSAGE,
        );
      }

      const config = await this.configService.load();
      if (!config.portalBaseUrl?.trim()) {
        return this.safeFail(
          BLS_PASSWORD_CHANGE_PIPELINE_ERROR_CODE,
          'Portal address is not set (VISES_PORTAL_BASE_URL)',
        );
      }

      let loginUrl: string;
      try {
        loginUrl = this.configService.resolvePortalLoginUrl(config);
      } catch (err) {
        return this.safeFail(
          BLS_PASSWORD_CHANGE_PIPELINE_ERROR_CODE,
          err instanceof Error ? err.message : 'Invalid portal login URL',
        );
      }

      if (config.proxyMisconfigured) {
        return this.safeFail(
          BLS_PASSWORD_CHANGE_PIPELINE_ERROR_CODE,
          'Proxy provider misconfigured',
        );
      }

      if (config.proxyEnabled) {
        lease = await this.proxyProvider.acquire(config);
      }

      if (context.abortSignal?.aborted) {
        return buildBlsClientAbortResult();
      }

      newPasswordPlain = generatePortalPassword();
      const headed = this.configService.resolveHeaded();
      const fill = await this.fillService.fillPasswordChange({
        targetUrl: loginUrl,
        portalFormEmail,
        currentPassword: currentPasswordPlain,
        newPassword: newPasswordPlain,
        headed,
        captchaServiceApiKey: config.captchaServiceApiKey,
        browserProxy: lease?.browserProxy,
        applicationId,
        abortSignal: context.abortSignal,
        onBrowserLaunched: context.registerCloseHook
          ? (close) => context.registerCloseHook!(close)
          : undefined,
      });

      currentPasswordPlain = undefined;

      if (fill.aborted === true || context.abortSignal?.aborted) {
        newPasswordPlain = undefined;
        return buildBlsClientAbortResult();
      }

      if (fill.navigationOk && fill.notPresented === true) {
        newPasswordPlain = undefined;
        this.logger.log(
          `bls_password_change_client not_presented workflowId=${workflowId}`,
        );
        return {
          ok: false,
          skipped: true,
          skipReason: BLS_PASSWORD_CHANGE_SKIP_REASON_NOT_PRESENTED,
        };
      }

      if (fill.navigationOk && fill.passwordChanged === true) {
        await this.secretVault.persistSecret({
          workflowId,
          applicationId,
          purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
          plain: newPasswordPlain,
        });
        newPasswordPlain = undefined;
        this.logger.log(
          `bls_password_change_client success workflowId=${workflowId} vault_rotated=true`,
        );
        return { ok: true, verifiedExternalState: true };
      }

      newPasswordPlain = undefined;

      if (fill.errorCode?.trim()) {
        return this.safeFail(
          fill.errorCode.trim(),
          fill.error?.slice(0, 500) ?? 'Password change fill failed',
        );
      }

      if (fill.submitAmbiguous === true) {
        return {
          ok: false,
          errorClass: BLS_WORKFLOW_ERROR_CLASS.VERIFY_THEN_REPEAT,
          errorCode: BLS_PASSWORD_CHANGE_SUBMIT_AMBIGUOUS_ERROR_CODE,
          errorMessage:
            fill.error?.slice(0, 500) ??
            BLS_PASSWORD_CHANGE_SUBMIT_AMBIGUOUS_ERROR_MESSAGE,
        };
      }

      return this.safeFail(
        BLS_PASSWORD_CHANGE_PIPELINE_ERROR_CODE,
        fill.error?.slice(0, 500) ?? 'Password change fill failed',
      );
    } catch (err) {
      if (context.abortSignal?.aborted) {
        return buildBlsClientAbortResult();
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `bls_password_change_client unexpected failure workflowId=${workflowId} ${message}`,
      );
      return this.safeFail(
        BLS_PASSWORD_CHANGE_PIPELINE_ERROR_CODE,
        message.slice(0, 500),
      );
    } finally {
      currentPasswordPlain = undefined;
      newPasswordPlain = undefined;
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
