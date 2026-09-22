import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailTmService } from '../../../mailtm';
import { Application } from '../../../database/entities/application.entity';
import {
  BLS_SECRET_PURPOSE,
  BLS_WORKFLOW_ERROR_CLASS,
  BLS_WORKFLOW_EVENT_TYPE,
  BLS_WORKFLOW_STEP_KEY,
  PORTAL_AUTOFILL_CAPTURE_STATUS,
  PORTAL_AUTOFILL_LOCK_HEARTBEAT_MS,
  PORTAL_AUTOFILL_RUN_STATUS,
} from '../../constants';
import { BlsSecretVaultService } from '../../bls-secret-vault.service';
import { PortalAutofillRunPersistenceService } from '../../portal-autofill-run-persistence.service';
import { PortalConfigService } from '../../portal-config.service';
import { PortalDataService } from '../../portal-data.service';
import { PortalFieldMapperService } from '../../portal-field-mapper.service';
import { PortalFillService } from '../../portal-fill.service';
import { PortalSiteAdapterRegistry } from '../../portal-site-adapter.registry';
import { BlsWorkflowService } from '../../workflow/bls-workflow.service';
import {
  evidenceFileExists,
  generatePortalPassword,
  listApplicationApplicantIds,
  shouldRetainMailTmMailboxAfterOtp,
  unlinkEvidenceBestEffort,
} from '../../utils';
import {
  BLS_REGISTER_NO_APPLICANT_ERROR_CODE,
  BLS_REGISTER_NO_APPLICANT_ERROR_MESSAGE,
  BLS_REGISTER_PIPELINE_ERROR_CODE,
  BLS_REGISTER_SUBMIT_AMBIGUOUS_ERROR_CODE,
  BLS_REGISTER_SUBMIT_AMBIGUOUS_ERROR_MESSAGE,
  PROXY_PROVIDER,
} from '../constants';
import type { BlsRegisterClient } from '../interfaces';
import type { ProxyProvider } from '../interfaces';
import type { BlsClientResult, BlsClientTaskContext } from '../types';
import type { ProxyProviderLease } from '../types';

/**
 * REGISTER domain client (REQ-009 / REQ-010 / DEC-019).
 * Soft-links `portal_autofill_runs` for evidence continuity (REQ-026 / DEC-012);
 * bls_* remains SoT — never COMPLETED from run row alone.
 */
@Injectable()
export class BlsRegisterClientService implements BlsRegisterClient {
  private readonly logger = new Logger(BlsRegisterClientService.name);

  constructor(
    private readonly configService: PortalConfigService,
    private readonly dataService: PortalDataService,
    private readonly mapper: PortalFieldMapperService,
    private readonly fillService: PortalFillService,
    private readonly siteAdapters: PortalSiteAdapterRegistry,
    private readonly secretVault: BlsSecretVaultService,
    private readonly mailTm: MailTmService,
    private readonly runPersistence: PortalAutofillRunPersistenceService,
    private readonly workflowService: BlsWorkflowService,
    @Inject(PROXY_PROVIDER)
    private readonly proxyProvider: ProxyProvider,
    @InjectRepository(Application)
    private readonly appsRepo: Repository<Application>,
  ) {}

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    const { workflowId, applicationId, stepId, attemptNo } = context;
    this.logger.log(
      `bls_register_client start workflowId=${workflowId} taskKey=${context.taskKey} attemptNo=${attemptNo}`,
    );

    let lease: ProxyProviderLease | undefined;
    let mailTmCleanup:
      | { accountId: string; token: string }
      | undefined;
    let mailTmPassword: string | undefined;
    let accountRetained = false;
    let linkedRunId: string | undefined;
    let evidenceRelativePath: string | null = null;
    let evidenceAbsolutePath: string | undefined;

    try {
      const app = await this.appsRepo.findOne({
        where: { id: applicationId },
      });
      if (!app) {
        return this.safeFail(
          BLS_REGISTER_PIPELINE_ERROR_CODE,
          'Application not found',
        );
      }

      const applicantIds = listApplicationApplicantIds(app.applicants);
      const applicantId =
        context.applicantId?.trim() || applicantIds[0] || '';
      if (!applicantId) {
        return this.safeFail(
          BLS_REGISTER_NO_APPLICANT_ERROR_CODE,
          BLS_REGISTER_NO_APPLICANT_ERROR_MESSAGE,
        );
      }

      // REQ-010 / TASK-005: generate before fill; encrypt immediately; never log.
      const portalPasswordPlain = generatePortalPassword();
      await this.secretVault.persistSecret({
        workflowId,
        applicationId,
        purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
        plain: portalPasswordPlain,
      });
      this.logger.log(
        `bls_register_client portal_password_vaulted workflowId=${workflowId}`,
      );

      const config = await this.configService.load();
      if (!config.portalBaseUrl) {
        return this.safeFail(
          BLS_REGISTER_PIPELINE_ERROR_CODE,
          'Portal address is not set (VISES_PORTAL_BASE_URL)',
        );
      }

      let targetUrl: string;
      try {
        targetUrl = this.configService.resolvePortalRegisterUrl(config);
      } catch (err) {
        return this.safeFail(
          BLS_REGISTER_PIPELINE_ERROR_CODE,
          err instanceof Error ? err.message : 'Invalid portal configuration',
        );
      }

      const loaded = await this.dataService.load({
        applicationId,
        applicantId,
      });

      const siteAdapter = this.siteAdapters.resolve({
        submitCountry: loaded.application.submitCountry ?? '',
      });
      if (!siteAdapter) {
        return this.safeFail(
          BLS_REGISTER_PIPELINE_ERROR_CODE,
          'Unsupported submit country for portal registration',
        );
      }

      const capMonsterKey = config.capMonsterApiKey?.trim() ?? '';
      const capMonsterEnabled = capMonsterKey.length > 0;
      const mailTmBaseUrl = config.mailTmApiBaseUrl?.trim() ?? '';
      const otpPathArmed =
        capMonsterEnabled &&
        config.emailOtpEnabled &&
        mailTmBaseUrl.length > 0;

      const mapping = this.mapper.mapFields(
        loaded.application,
        loaded.applicant,
        otpPathArmed ? { otpPathArmed: true } : undefined,
      );
      if (!mapping.ok) {
        return this.safeFail(
          BLS_REGISTER_PIPELINE_ERROR_CODE,
          'Field mapping aborted before RegisterUser fill',
        );
      }

      if (config.proxy6Misconfigured) {
        return this.safeFail(
          BLS_REGISTER_PIPELINE_ERROR_CODE,
          'Proxy6 misconfigured',
        );
      }

      if (config.proxy6Enabled) {
        lease = await this.proxyProvider.acquire(config);
      }

      // DEC-012 / TASK-016: create or reclaim linked run; soft-link step only.
      const linked = await this.runPersistence.ensureLinkedForRegisterStep({
        workflowId,
        stepId,
        applicationId,
        applicantId,
      });
      linkedRunId = linked.runId;
      evidenceRelativePath = linked.relativePath;
      evidenceAbsolutePath = linked.absolutePath;

      await this.workflowService
        .appendEvent({
          workflowId,
          eventType: BLS_WORKFLOW_EVENT_TYPE.AUTOFILL_RUN_LINKED,
          stepKey: BLS_WORKFLOW_STEP_KEY.REGISTER,
          taskKey: context.taskKey,
          payloadSafe: {
            runId: linked.runId,
            stepId,
            created: linked.created,
          },
        })
        .catch((err) => {
          const detail = err instanceof Error ? err.message : String(err);
          this.logger.warn(
            `bls_register_client autofill_run_linked_event skipped ${detail}`,
          );
        });

      await this.runPersistence.markNavigating(linked.runId);

      const headed = this.configService.resolveHeaded();
      const heartbeatTimer = setInterval(() => {
        void this.runPersistence
          .bumpHeartbeat(linked.runId)
          .catch(() => undefined);
      }, PORTAL_AUTOFILL_LOCK_HEARTBEAT_MS);

      let fill;
      try {
        fill = await this.fillService.fillRegisterForm({
          targetUrl,
          mapping,
          headed,
          screenshotPath: linked.absolutePath,
          capMonsterApiKey: config.capMonsterApiKey,
          browserProxy: lease?.browserProxy,
          otpPathArmed,
          runId: linked.runId,
          submitRegisterForm: true,
          checkpoint: {
            onCheckpoint: (patch) =>
              this.runPersistence.applyCheckpoint(linked.runId, patch),
            onHeartbeat: () => this.runPersistence.bumpHeartbeat(linked.runId),
          },
        });
      } finally {
        clearInterval(heartbeatTimer);
      }

      if (fill.mailTmCleanup) {
        mailTmCleanup = fill.mailTmCleanup;
      }
      if (fill.mailTmPassword) {
        mailTmPassword = fill.mailTmPassword;
      }

      const portalFormEmailToPersist = fill.mailTmAddress?.trim() ?? '';
      if (portalFormEmailToPersist) {
        try {
          await this.appsRepo.update(
            { id: applicationId },
            { portalFormEmail: portalFormEmailToPersist },
          );
        } catch (persistErr) {
          const detail =
            persistErr instanceof Error
              ? persistErr.message
              : 'portal_form_email_persist_failed';
          this.logger.error(
            `bls_register_client portal_form_email_persist failure ${detail}`,
          );
          if (mailTmCleanup) {
            await this.mailTm.deleteAccount(mailTmCleanup).catch(() => undefined);
            mailTmCleanup = undefined;
            mailTmPassword = undefined;
          }
          if (evidenceAbsolutePath) {
            unlinkEvidenceBestEffort(evidenceAbsolutePath);
          }
          await this.terminalizeLinkedRun({
            runId: linked.runId,
            ok: false,
            relativePath: null,
            absolutePath: evidenceAbsolutePath,
            errorNote: 'Failed to persist portal form email',
          });
          return this.safeFail(
            BLS_REGISTER_PIPELINE_ERROR_CODE,
            'Failed to persist portal form email',
            null,
          );
        }
      }

      const retainMailbox = shouldRetainMailTmMailboxAfterOtp(
        fill.emailOtpOk,
        Boolean(mailTmCleanup),
      );
      if (retainMailbox && mailTmCleanup) {
        const passwordPlain = mailTmPassword?.trim() ?? '';
        const tokenPlain = mailTmCleanup.token.trim();
        if (passwordPlain && tokenPlain) {
          try {
            await this.secretVault.persistSecret({
              workflowId,
              applicationId,
              purpose: BLS_SECRET_PURPOSE.MAILTM_PASSWORD,
              plain: passwordPlain,
            });
            await this.secretVault.persistSecret({
              workflowId,
              applicationId,
              purpose: BLS_SECRET_PURPOSE.MAILTM_TOKEN,
              plain: tokenPlain,
            });
          } catch (vaultErr) {
            const vaultDetail =
              vaultErr instanceof Error
                ? vaultErr.message
                : 'mailtm_vault_persist_failed';
            this.logger.error(
              `bls_register_client mailtm_vault failure ${vaultDetail}`,
            );
          }
        }
        accountRetained = true;
        mailTmCleanup = undefined;
        mailTmPassword = undefined;
      }

      if (
        fill.navigationOk &&
        fill.registerSuccessVerified === true
      ) {
        await this.terminalizeLinkedRun({
          runId: linked.runId,
          ok: true,
          relativePath: evidenceRelativePath,
          absolutePath: evidenceAbsolutePath,
          errorNote: null,
        });
        this.logger.log(
          `bls_register_client success workflowId=${workflowId} verified=true runId=${linked.runId}`,
        );
        return { ok: true, verifiedExternalState: true };
      }

      if (
        fill.registerSubmitAmbiguous === true ||
        fill.registerSubmitted === true
      ) {
        const message =
          fill.error?.slice(0, 500) ??
          BLS_REGISTER_SUBMIT_AMBIGUOUS_ERROR_MESSAGE;
        await this.terminalizeLinkedRun({
          runId: linked.runId,
          ok: false,
          relativePath: evidenceRelativePath,
          absolutePath: evidenceAbsolutePath,
          errorNote: message,
        });
        return {
          ok: false,
          errorClass: BLS_WORKFLOW_ERROR_CLASS.VERIFY_THEN_REPEAT,
          errorCode: BLS_REGISTER_SUBMIT_AMBIGUOUS_ERROR_CODE,
          errorMessage: message,
          evidenceRelativePath: this.resolveStoredEvidencePath(
            evidenceRelativePath,
            evidenceAbsolutePath,
          ),
        };
      }

      const failMessage =
        fill.error?.slice(0, 500) ?? 'RegisterUser fill failed';
      await this.terminalizeLinkedRun({
        runId: linked.runId,
        ok: false,
        relativePath: evidenceRelativePath,
        absolutePath: evidenceAbsolutePath,
        errorNote: failMessage,
      });
      return this.safeFail(
        BLS_REGISTER_PIPELINE_ERROR_CODE,
        failMessage,
        this.resolveStoredEvidencePath(
          evidenceRelativePath,
          evidenceAbsolutePath,
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `bls_register_client unexpected failure workflowId=${workflowId} ${message}`,
      );
      if (linkedRunId) {
        await this.terminalizeLinkedRun({
          runId: linkedRunId,
          ok: false,
          relativePath: null,
          absolutePath: evidenceAbsolutePath,
          errorNote: message.slice(0, 500),
        }).catch(() => undefined);
      }
      return this.safeFail(
        BLS_REGISTER_PIPELINE_ERROR_CODE,
        message.slice(0, 500),
        null,
      );
    } finally {
      if (!accountRetained && mailTmCleanup) {
        await this.mailTm.deleteAccount(mailTmCleanup).catch(() => undefined);
      }
      if (lease) {
        await lease.release().catch(() => undefined);
      }
    }
  }

  private safeFail(
    errorCode: string,
    errorMessage: string,
    evidenceRelativePath?: string | null,
  ): BlsClientResult {
    return {
      ok: false,
      errorClass: BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT,
      errorCode,
      errorMessage,
      ...(evidenceRelativePath !== undefined
        ? { evidenceRelativePath }
        : {}),
    };
  }

  /**
   * Persist linked run terminal metadata only — never drives workflow COMPLETED
   * (REQ-007 / DEC-012). No secrets on the row.
   */
  private async terminalizeLinkedRun(input: {
    runId: string;
    ok: boolean;
    relativePath: string | null;
    absolutePath: string | undefined;
    errorNote: string | null;
  }): Promise<void> {
    const pngPresent =
      input.absolutePath != null && evidenceFileExists(input.absolutePath);
    const storedRelative =
      pngPresent && input.relativePath ? input.relativePath : null;
    if (!pngPresent && input.absolutePath) {
      unlinkEvidenceBestEffort(input.absolutePath);
    }
    try {
      await this.runPersistence.persistTerminal({
        runId: input.runId,
        status: input.ok
          ? PORTAL_AUTOFILL_RUN_STATUS.SUCCEEDED
          : PORTAL_AUTOFILL_RUN_STATUS.FAILED,
        captureStatus: pngPresent
          ? PORTAL_AUTOFILL_CAPTURE_STATUS.CAPTURED
          : PORTAL_AUTOFILL_CAPTURE_STATUS.CAPTURE_FAILED,
        reportOk: input.ok,
        screenshotRelativePath: storedRelative,
        errorNote: input.errorNote,
        terminalReason: input.ok ? null : input.errorNote,
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `bls_register_client persist_terminal skipped runId=${input.runId} ${detail}`,
      );
      if (input.absolutePath) {
        unlinkEvidenceBestEffort(input.absolutePath);
      }
    }
  }

  private resolveStoredEvidencePath(
    relativePath: string | null,
    absolutePath: string | undefined,
  ): string | null {
    if (
      relativePath &&
      absolutePath &&
      evidenceFileExists(absolutePath)
    ) {
      return relativePath;
    }
    return null;
  }
}
