/**
 * HTTP-based REGISTER client (browserless port). Same BlsRegisterClient contract
 * and side effects as the patchright version: portal_autofill_runs link,
 * portalFormEmail persistence, portal-password email -> vault, mailbox cleanup.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { PortalHttpService } from '../portal-http.service';
import { PortalHttpFlowService } from '../portal-http-flow.service';
import { TempMailPlusHttpAdapter } from '../tempmail-plus-http.adapter';
import { BlsSecretVaultService } from '../../bls-secrets/bls-secret-vault.service';
import { BLS_SECRET_PURPOSE } from '../../bls-secrets/constants/bls-secret-purpose.constants';
import { PortalAutofillRunPersistenceService } from '../../portal-core/portal-autofill-run-persistence.service';
import type { BlsRegisterClient } from '../../bls-clients/interfaces/bls-register-client.interface';
import type { BlsClientResult, BlsClientTaskContext } from '../../bls-clients/types';
import { transliterate } from '../utils/transliterate.util';

const ERROR_CODE = 'bls_register_pipeline';

@Injectable()
export class BlsRegisterHttpClient implements BlsRegisterClient {
  private readonly logger = new Logger(BlsRegisterHttpClient.name);

  constructor(
    private readonly flow: PortalHttpFlowService,
    private readonly http: PortalHttpService,
    private readonly mail: TempMailPlusHttpAdapter,
    private readonly vault: BlsSecretVaultService,
    private readonly runPersistence: PortalAutofillRunPersistenceService,
    @InjectRepository(Application) private readonly appsRepo: Repository<Application>,
  ) {}

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    const { workflowId, applicationId, stepId, applicantId } = context;
    const app = await this.appsRepo.findOne({ where: { id: applicationId } });
    if (!app) return this.fail('Application not found');
    const applicant = (app.applicants || []).find((a) => a.id === applicantId) || (app.applicants || [])[0];
    if (!applicant) return this.fail('Applicant not found');

    // One portal account per passport: when this application already has a
    // portal login with a resolvable vaulted password, REGISTER is skipped and
    // the engine proceeds to LOGIN (POC-stabilized reuse semantics).
    const existingEmail = app.portalFormEmail?.trim();
    if (existingEmail) {
      let existingPassword = await this.vault.loadOrAdoptSecretPlain({
        workflowId,
        applicationId,
        purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
      });
      if (existingPassword === null) {
        // Recovery: a previous attempt may have registered the account but
        // timed out waiting for the welcome email (portal mails can lag
        // minutes). The password is still sitting in that mailbox — extract
        // and vault it now instead of dead-ending the workflow.
        try {
          const pwMail = await this.mail.findLatestMessageFor(existingEmail, {
            subjectPattern: /welcome|password/i,
          });
          const pwExtract = this.mail.extractPortalPassword({ body: pwMail.body });
          if (pwExtract.ok) {
            await this.vault.persistSecret({
              workflowId,
              applicationId,
              purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD_INITIAL,
              plain: pwExtract.password,
            });
            await this.vault.persistSecret({
              workflowId,
              applicationId,
              purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
              plain: pwExtract.password,
            });
            existingPassword = pwExtract.password;
            this.logger.log(`register(http): welcome email recovered from mailbox — password vaulted (${existingEmail})`);
          }
        } catch {
          // mailbox gone / empty — fall through to the explicit error
        }
      }
      if (existingPassword !== null) {
        this.logger.log(
          `register(http): portal account already exists (${existingEmail}) — skipping registration`,
        );
        return {
          ok: false,
          skipped: true,
          skipReason: 'alreadyRegistered',
        };
      }
      return this.fail(
        `Portal account ${existingEmail} already exists but its vaulted password is not resolvable — record the portal password (panel credentials input) or reset it on the portal`,
        undefined,
        'bls_register_password_unresolvable',
      );
    }

    const linked = await this.runPersistence.ensureLinkedForRegisterStep({
      workflowId, stepId, applicationId, applicantId: applicant.id,
    });
    await this.runPersistence.markNavigating(linked.runId);
    const autofillRunLinked = { runId: linked.runId, stepId, created: linked.created };

    let mailboxAddress: string | null = null;
    try {
      const mailbox = await this.mail.createAccount({ contextKey: workflowId });
      mailboxAddress = mailbox.address;

      const { hiddens, captchaDataUrl } = await this.flow.fetchRegisterTokens();
      const { passportTypeId, birthCountryId } = await this.flow.fetchGuids();
      const captchaData = await this.flow.solveRegisterCaptcha(captchaDataUrl);

      const values = {
        surName: transliterate(String(applicant.lastName ?? '')),
        firstName: transliterate(String(applicant.firstName ?? '')),
        lastName: transliterate(String(applicant.lastNameAtBirth ?? applicant.lastName ?? '')),
        dob: String(applicant.dob ?? '').slice(0, 10),
        passportNumber: String(applicant.passportNumber ?? ''),
        issueDate: String(applicant.passportIssued ?? '').slice(0, 10),
        expiryDate: String(applicant.passportExpires ?? '').slice(0, 10),
        issuePlace: transliterate(String(applicant.passportIssuedBy ?? '')),
        mobile: String(applicant.phone ?? '').replace(/\D/g, ''),
        email: mailbox.address,
      };
      const formBody = this.flow.buildRegisterBody({ hiddens, captchaData, passportTypeId, birthCountryId, values });

      const otpRes = await this.http.postForm(
        '/Global/account/SendRegisterUserVerificationCode', formBody,
        `${this.http.baseUrl()}/Global/Account/RegisterUser`, { xhr: true },
      );
      let otpJson: { success?: boolean; error?: string; encryptEmail?: string; encryptMobile?: string; securityCode?: string } | null = null;
      try { otpJson = JSON.parse(otpRes.text); } catch { otpJson = null; }
      if (!otpJson?.success) {
        return this.fail(`OTP send failed: ${otpJson?.error ?? otpRes.status}`);
      }

      const otpMail = await this.mail.waitLatestMessageFor(mailbox.address, {
        subjectPattern: /verification/i,
      });
      const otpExtract = this.mail.extractOtp({ body: otpMail.body });
      if (!otpExtract.ok) return this.fail('OTP not found in email');
      const otp = otpExtract.otp;

      const submitBody = this.flow.buildRegisterBody({
        hiddens, captchaData, passportTypeId, birthCountryId, values,
        emailOtp: otp,
        encryptedEmail: otpJson.encryptEmail,
        encryptedMobile: otpJson.encryptMobile,
        securityCode: otpJson.securityCode,
      });
      const regRes = await this.http.postForm(
        '/Global/Account/RegisterUser', submitBody,
        `${this.http.baseUrl()}/Global/Account/RegisterUser`, { xhr: true },
      );
      let regJson: { success?: boolean; error?: string } | null = null;
      try { regJson = JSON.parse(regRes.text); } catch { regJson = null; }
      if (!regJson?.success) return this.fail(`register submit failed: ${regJson?.error ?? regRes.status}`);

      await this.appsRepo.update({ id: applicationId }, { portalFormEmail: mailbox.address });

      const pwMail = await this.mail.waitLatestMessageFor(mailbox.address, {
        excludeMessageIds: [otpMail.messageId],
        subjectPattern: /welcome|password/i,
        // Portal welcome mails can lag minutes behind the OTP — do not
        // dead-end a successful registration on a short wait.
        timeoutMs: 300_000,
      });
      const pwExtract = this.mail.extractPortalPassword({ body: pwMail.body });
      if (!pwExtract.ok) return this.fail('portal password not found in welcome email');
      await this.vault.persistSecret({
        workflowId, applicationId,
        purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD_INITIAL,
        plain: pwExtract.password,
      });
      await this.vault.persistSecret({
        workflowId, applicationId,
        purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
        plain: pwExtract.password,
      });
      await this.mail.deleteAccount({ contextKey: workflowId, address: mailbox.address });

      await this.runPersistence.persistTerminal({
        runId: linked.runId, status: 'SUCCEEDED' as never,
        captureStatus: 'skipped', reportOk: true,
        terminalReason: 'browserless_http_register',
      });
      return { ok: true, verifiedExternalState: true, autofillRunLinked };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await this.runPersistence.persistTerminal({
        runId: linked.runId, status: 'FAILED' as never,
        captureStatus: 'skipped', reportOk: false,
        errorNote: msg, terminalReason: 'browserless_http_register_failed',
      }).catch(() => undefined);
      return this.fail(msg, autofillRunLinked);
    }
  }

  private fail(
    message: string,
    autofillRunLinked?: BlsClientResult extends never ? never : any,
    errorCode: string = ERROR_CODE,
  ): BlsClientResult {
    this.logger.error(`register(http): ${message}`);
    return {
      ok: false, skipped: false,
      errorClass: 'SAFE_TO_REPEAT' as const,
      errorCode,
      errorMessage: message,
      ...(autofillRunLinked ? { autofillRunLinked } : {}),
    };
  }
}
