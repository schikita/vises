/**
 * HTTP-based LOGIN client (browserless). Contract: ok only when the portal
 * session is authenticated after the email+captcha+password chain.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { PortalHttpFlowService } from '../portal-http-flow.service';
import { BlsSecretVaultService } from '../../bls-secrets/bls-secret-vault.service';
import { BLS_SECRET_PURPOSE } from '../../bls-secrets/constants/bls-secret-purpose.constants';
import type { BlsLoginClient } from '../../bls-clients/interfaces/bls-login-client.interface';
import type { BlsClientResult, BlsClientTaskContext } from '../../bls-clients/types';

const ERROR_CODE = 'bls_login_pipeline';
const MISSING_EMAIL = 'Не найден email портала (portalFormEmail) для входа.';

@Injectable()
export class BlsLoginHttpClient implements BlsLoginClient {
  private readonly logger = new Logger(BlsLoginHttpClient.name);

  constructor(
    private readonly flow: PortalHttpFlowService,
    private readonly vault: BlsSecretVaultService,
    @InjectRepository(Application) private readonly appsRepo: Repository<Application>,
  ) {}

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    const { workflowId, applicationId } = context;
    const app = await this.appsRepo.findOne({ where: { id: applicationId } });
    if (!app) return this.fail('Application not found');
    const email = app.portalFormEmail?.trim();
    if (!email) return this.fail(MISSING_EMAIL);
    let password: string;
    try {
      password = await this.vault.loadOrAdoptSecretPlain({
        workflowId,
        applicationId,
        purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
      }) ?? '';
    } catch {
      password = '';
    }
    if (!password) {
      return this.fail('Portal password not found in vault (per-workflow and application-wide)');
    }
    try {
      const outcome = await this.flow.loginEnsureRotated(email, password, async (newPassword) => {
        await this.vault.persistSecret({
          workflowId, applicationId,
          purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
          plain: newPassword,
        });
      });
      if (outcome.state === 'need_password_change') {
        // authenticated, but the portal forces a password change — the
        // PASSWORD_CHANGE step handles it; login itself succeeded.
        this.logger.warn('login(http): forced password change pending');
      }
      const authed = await this.flow.isAuthenticated();
      if (!authed) return this.fail('not authenticated after login chain');
      return { ok: true, verifiedExternalState: true };
    } catch (e) {
      return this.fail(e instanceof Error ? e.message : String(e));
    }
  }

  private fail(message: string): BlsClientResult {
    this.logger.error(`login(http): ${message}`);
    return { ok: false, skipped: false, errorClass: 'SAFE_TO_REPEAT', errorCode: ERROR_CODE, errorMessage: message };
  }
}
