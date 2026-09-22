import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../../database/entities/application.entity';
import {
  BLS_SECRET_PURPOSE,
  BLS_WORKFLOW_ERROR_CLASS,
} from '../../constants';
import { BlsSecretVaultService } from '../../bls-secret-vault.service';
import { PortalConfigService } from '../../portal-config.service';
import { PortalLoginPrepFillService } from '../../portal-login-prep-fill.service';
import {
  BLS_LOGIN_MISSING_EMAIL_ERROR_MESSAGE,
  BLS_LOGIN_MISSING_PASSWORD_ERROR_MESSAGE,
  BLS_LOGIN_PIPELINE_ERROR_CODE,
  BLS_LOGIN_SUBMIT_AMBIGUOUS_ERROR_CODE,
  BLS_LOGIN_SUBMIT_AMBIGUOUS_ERROR_MESSAGE,
  PROXY_PROVIDER,
} from '../constants';
import type { BlsLoginClient, ProxyProvider } from '../interfaces';
import type { BlsClientResult, BlsClientTaskContext } from '../types';
import type { ProxyProviderLease } from '../types';

/**
 * LOGIN domain client (REQ-011 / REQ-014 / TASK-009).
 * Extends login-prep past email+verify: decrypt vault password in-memory,
 * submit, verify authenticated landing. No storageState; never log secrets.
 */
@Injectable()
export class BlsLoginClientService implements BlsLoginClient {
  private readonly logger = new Logger(BlsLoginClientService.name);

  constructor(
    private readonly configService: PortalConfigService,
    private readonly fillService: PortalLoginPrepFillService,
    private readonly secretVault: BlsSecretVaultService,
    @Inject(PROXY_PROVIDER)
    private readonly proxyProvider: ProxyProvider,
    @InjectRepository(Application)
    private readonly appsRepo: Repository<Application>,
  ) {}

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    const { workflowId, applicationId, attemptNo } = context;
    this.logger.log(
      `bls_login_client start workflowId=${workflowId} taskKey=${context.taskKey} attemptNo=${attemptNo}`,
    );

    let lease: ProxyProviderLease | undefined;
    let portalPasswordPlain: string | undefined;

    try {
      const app = await this.appsRepo.findOne({
        where: { id: applicationId },
      });
      if (!app) {
        return this.safeFail(
          BLS_LOGIN_PIPELINE_ERROR_CODE,
          'Application not found',
        );
      }

      const portalFormEmail = app.portalFormEmail?.trim() ?? '';
      if (!portalFormEmail) {
        return this.safeFail(
          BLS_LOGIN_PIPELINE_ERROR_CODE,
          BLS_LOGIN_MISSING_EMAIL_ERROR_MESSAGE,
        );
      }

      const loadedPassword = await this.secretVault.loadSecretPlain({
        workflowId,
        purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
      });
      portalPasswordPlain = loadedPassword ?? undefined;
      if (!portalPasswordPlain?.trim()) {
        return this.safeFail(
          BLS_LOGIN_PIPELINE_ERROR_CODE,
          BLS_LOGIN_MISSING_PASSWORD_ERROR_MESSAGE,
        );
      }

      const config = await this.configService.load();
      if (!config.portalBaseUrl?.trim()) {
        return this.safeFail(
          BLS_LOGIN_PIPELINE_ERROR_CODE,
          'Portal address is not set (VISES_PORTAL_BASE_URL)',
        );
      }

      let loginUrl: string;
      try {
        loginUrl = this.configService.resolvePortalLoginUrl(config);
      } catch (err) {
        return this.safeFail(
          BLS_LOGIN_PIPELINE_ERROR_CODE,
          err instanceof Error ? err.message : 'Invalid portal login URL',
        );
      }

      if (config.proxy6Misconfigured) {
        return this.safeFail(
          BLS_LOGIN_PIPELINE_ERROR_CODE,
          'Proxy6 misconfigured',
        );
      }

      if (config.proxy6Enabled) {
        lease = await this.proxyProvider.acquire(config);
      }

      const headed = this.configService.resolveHeaded();
      const fill = await this.fillService.fillLoginPrep({
        targetUrl: loginUrl,
        portalFormEmail,
        headed,
        capMonsterApiKey: config.capMonsterApiKey,
        browserProxy: lease?.browserProxy,
        applicationId,
        submitPassword: true,
        portalPassword: portalPasswordPlain,
      });

      // Drop plaintext reference ASAP after fill returns.
      portalPasswordPlain = undefined;

      if (
        fill.navigationOk &&
        fill.loginAuthenticatedVerified === true
      ) {
        this.logger.log(
          `bls_login_client success workflowId=${workflowId} verified=true`,
        );
        return { ok: true, verifiedExternalState: true };
      }

      if (
        fill.passwordSubmitAmbiguous === true ||
        fill.passwordSubmitted === true
      ) {
        return {
          ok: false,
          errorClass: BLS_WORKFLOW_ERROR_CLASS.VERIFY_THEN_REPEAT,
          errorCode: BLS_LOGIN_SUBMIT_AMBIGUOUS_ERROR_CODE,
          errorMessage:
            fill.error?.slice(0, 500) ??
            BLS_LOGIN_SUBMIT_AMBIGUOUS_ERROR_MESSAGE,
        };
      }

      return this.safeFail(
        BLS_LOGIN_PIPELINE_ERROR_CODE,
        fill.error?.slice(0, 500) ?? 'Login fill failed',
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `bls_login_client unexpected failure workflowId=${workflowId} ${message}`,
      );
      return this.safeFail(
        BLS_LOGIN_PIPELINE_ERROR_CODE,
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
