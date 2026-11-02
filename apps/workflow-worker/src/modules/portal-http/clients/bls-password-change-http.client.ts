/**
 * HTTP-based PASSWORD_CHANGE client: full login, then if the portal presents
 * the forced change-password page — rotate the vault password. Not presented
 * -> skipped (same semantics as the patchright client).
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomInt } from 'node:crypto';
import { Application } from '../../database/entities/application.entity';
import { PortalHttpService } from '../portal-http.service';
import { PortalHttpFlowService } from '../portal-http-flow.service';
import { parseFormHiddens } from '../utils/portal-html.util';
import { generatePortalPassword } from '../../bls-secrets/utils/generate-portal-password.util';
import { BlsSecretVaultService } from '../../bls-secrets/bls-secret-vault.service';
import { BLS_SECRET_PURPOSE } from '../../bls-secrets/constants/bls-secret-purpose.constants';
import type { BlsPasswordChangeClient } from '../../bls-clients/interfaces/bls-password-change-client.interface';
import type { BlsClientResult, BlsClientTaskContext } from '../../bls-clients/types';

const ERROR_CODE = 'bls_password_change_pipeline';

@Injectable()
export class BlsPasswordChangeHttpClient implements BlsPasswordChangeClient {
  private readonly logger = new Logger(BlsPasswordChangeHttpClient.name);

  constructor(
    private readonly flow: PortalHttpFlowService,
    private readonly http: PortalHttpService,
    private readonly vault: BlsSecretVaultService,
    @InjectRepository(Application) private readonly appsRepo: Repository<Application>,
  ) {}

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    const { workflowId, applicationId } = context;
    const app = await this.appsRepo.findOne({ where: { id: applicationId } });
    if (!app) return this.fail('Application not found');
    const email = app.portalFormEmail?.trim();
    if (!email) return this.fail('portalFormEmail missing');
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
      if (outcome.state !== 'need_password_change') {
        return { ok: false, skipped: true, skipReason: 'notPresented' };
      }
      const hiddens = parseFormHiddens(outcome.pageHtml, 'ChangeUserPassword') || {};
      const newPassword = generatePortalPassword();
      const body: Array<[string, string]> = [
        ['CurrentPassword', password],
        ['NewPassword', newPassword],
        ['ConfirmPassword', newPassword],
        ...Object.entries(hiddens),
      ];
      const res = await this.http.postForm('/Global/account/ChangeUserPassword', body, outcome.pageUrl, { xhr: true });
      let json: { success?: boolean; error?: string } | null = null;
      try { json = JSON.parse(res.text); } catch { json = null; }
      if (!json?.success) return this.fail(`password change rejected: ${json?.error ?? res.status}`);
      await this.vault.persistSecret({
        workflowId, applicationId, purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD, plain: newPassword,
      });
      this.logger.log('password rotated (http) and vaulted');
      // session is invalidated after change — re-login check happens in STATUS
      return { ok: true, verifiedExternalState: true };
    } catch (e) {
      return this.fail(e instanceof Error ? e.message : String(e));
    }
  }

  private fail(message: string): BlsClientResult {
    this.logger.error(`password-change(http): ${message}`);
    return { ok: false, skipped: false, errorClass: 'SAFE_TO_REPEAT', errorCode: ERROR_CODE, errorMessage: message };
  }
}
