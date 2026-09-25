import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { BLS_SECRET_PURPOSE, BlsSecretVaultService } from '../../bls-secrets';
import {
  MAILTM_WAIT_FOR_EMAIL_MS,
  TEMPORARY_EMAIL_PROVIDER,
  type DeleteTemporaryMailboxInput,
  type TemporaryEmailProvider,
} from '../../browser-mail';
import {
  BLS_WORKFLOW_ABORT_ERROR_MESSAGE,
  BLS_WORKFLOW_ERROR_CLASS,
} from '../../bls-workflow/constants/bls-workflow.constants';
import { collectBlsApplicationApplicantDateViolations } from '../../bls-workflow/utils/collect-bls-application-applicant-date-violations.util';
import { formatBlsApplicantDateViolationsDetail } from '../../bls-workflow/utils/format-bls-applicant-date-violations-detail.util';
import { applyApplicationNeedsFixesStatus } from '../../apps/utils/apply-application-needs-fixes-status.util';
import {
  evidenceFileExists,
  listApplicationApplicantIds,
  PORTAL_AUTOFILL_CAPTURE_STATUS,
  PORTAL_AUTOFILL_LOCK_HEARTBEAT_MS,
  PORTAL_AUTOFILL_RUN_STATUS,
  PortalAutofillRunPersistenceService,
  PortalConfigService,
  PortalDataService,
  PortalFieldMapperService,
  PortalSiteAdapterRegistry,
  unlinkEvidenceBestEffort,
} from '../../portal-core';
import {
  isPortalEmailOtpArmed,
  PortalFillService,
  shouldRetainMailTmMailboxAfterOtp,
} from '../../portal-fill';
import {
  BLS_REGISTER_MID_RUN_DATE_GATE_ERROR_CODE,
  BLS_REGISTER_NO_APPLICANT_ERROR_CODE,
  BLS_REGISTER_NO_APPLICANT_ERROR_MESSAGE,
  BLS_REGISTER_PIPELINE_ERROR_CODE,
  BLS_REGISTER_PORTAL_PASSWORD_EMAIL_ERROR_CODE,
  BLS_REGISTER_PORTAL_PASSWORD_EMAIL_ERROR_MESSAGE,
  BLS_REGISTER_SUBMIT_AMBIGUOUS_ERROR_CODE,
  BLS_REGISTER_SUBMIT_AMBIGUOUS_ERROR_MESSAGE,
  PROXY_PROVIDER,
} from '../constants';
import type { BlsRegisterClient } from '../interfaces';
import type { ProxyProvider } from '../interfaces';
import type {
  BlsAutofillRunLinkedMetadata,
  BlsClientResult,
  BlsClientTaskContext,
  ProxyProviderLease,
} from '../types';
import { buildBlsClientAbortResult } from '../utils/build-bls-client-abort-result.util';

/**
 * REGISTER domain client (REQ-009 / REQ-010 / DEC-019).
 * Soft-links `portal_autofill_runs` for evidence continuity (REQ-026 / DEC-012);
 * bls_* remains SoT — never COMPLETED from run row alone.
 * After RegisterUser success, waits for the emailed 6-digit portal password and
 * vaults PORTAL_PASSWORD_INITIAL + PORTAL_PASSWORD (never invents a password).
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
    @Inject(TEMPORARY_EMAIL_PROVIDER)
    private readonly mailProvider: TemporaryEmailProvider,
    private readonly runPersistence: PortalAutofillRunPersistenceService,
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
    let temporaryMailboxCleanup: DeleteTemporaryMailboxInput | undefined;
    let temporaryMailboxPassword: string | undefined;
    let accountRetained = false;
    let linkedRunId: string | undefined;
    let evidenceRelativePath: string | null = null;
    let evidenceAbsolutePath: string | undefined;
    let portalPasswordPlain: string | undefined;
    let autofillRunLinked: BlsAutofillRunLinkedMetadata | undefined;

    try {
      if (context.abortSignal?.aborted) {
        return await this.abortWithLinkedRunTerminalize({
          linkedRunId,
          evidenceRelativePath,
          evidenceAbsolutePath,
          autofillRunLinked,
        });
      }

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

      // Mid-run date-only defense (REQ-005 / DEC-003): workflow already exists.
      // Distinct from create/start/retry/resume start-gate 400 and from OTP
      // pipeline failures (OTP must not set «Нужны правки» solely for OTP fail).
      const dateViolations = collectBlsApplicationApplicantDateViolations({
        applicants: app.applicants,
        returnDate: app.returnDate,
      });
      if (dateViolations.length > 0) {
        if (applyApplicationNeedsFixesStatus(app)) {
          await this.appsRepo.save(app);
        }
        return this.safeFail(
          BLS_REGISTER_MID_RUN_DATE_GATE_ERROR_CODE,
          formatBlsApplicantDateViolationsDetail(dateViolations),
        );
      }

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

      const otpPathArmed = isPortalEmailOtpArmed(config);

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

      if (config.proxyMisconfigured) {
        return this.safeFail(
          BLS_REGISTER_PIPELINE_ERROR_CODE,
          'Proxy provider misconfigured',
        );
      }

      if (config.proxyEnabled) {
        lease = await this.proxyProvider.acquire(config);
      }

      if (context.abortSignal?.aborted) {
        return await this.abortWithLinkedRunTerminalize({
          linkedRunId,
          evidenceRelativePath,
          evidenceAbsolutePath,
          autofillRunLinked,
        });
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
      /** Executor appends AUTOFILL_RUN_LINKED (DEC-004 side-effect inversion). */
      autofillRunLinked = {
        runId: linked.runId,
        stepId,
        created: linked.created,
      };

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
          captchaServiceApiKey: config.captchaServiceApiKey,
          browserProxy: lease?.browserProxy,
          otpPathArmed,
          emailContextKey: workflowId,
          runId: linked.runId,
          submitRegisterForm: true,
          abortSignal: context.abortSignal,
          onBrowserLaunched: context.registerCloseHook
            ? (close) => context.registerCloseHook!(close)
            : undefined,
          checkpoint: {
            onCheckpoint: (patch) =>
              this.runPersistence.applyCheckpoint(linked.runId, patch),
            onHeartbeat: () => this.runPersistence.bumpHeartbeat(linked.runId),
          },
        });
      } finally {
        clearInterval(heartbeatTimer);
      }

      if (fill.aborted === true || context.abortSignal?.aborted) {
        return await this.abortWithLinkedRunTerminalize({
          linkedRunId,
          evidenceRelativePath,
          evidenceAbsolutePath,
          autofillRunLinked,
        });
      }

      if (fill.temporaryMailboxCleanup) {
        temporaryMailboxCleanup = fill.temporaryMailboxCleanup;
      }
      if (fill.temporaryMailboxPassword) {
        temporaryMailboxPassword = fill.temporaryMailboxPassword;
      }

      const portalFormEmailToPersist = fill.temporaryMailboxAddress?.trim() ?? '';
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
          if (temporaryMailboxCleanup) {
            await this.mailProvider.deleteAccount(temporaryMailboxCleanup).catch(() => undefined);
            temporaryMailboxCleanup = undefined;
            temporaryMailboxPassword = undefined;
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
            autofillRunLinked,
          );
        }
      }

      if (
        fill.navigationOk &&
        fill.registerSuccessVerified === true
      ) {
        // Browser mode returns empty token (DEC-006); session reuse uses contextKey.
        const mailToken = temporaryMailboxCleanup?.token?.trim() ?? '';
        const otpMessageId = fill.emailOtpMessageId?.trim() ?? '';
        if (!temporaryMailboxCleanup) {
          await this.terminalizeLinkedRun({
            runId: linked.runId,
            ok: false,
            relativePath: evidenceRelativePath,
            absolutePath: evidenceAbsolutePath,
            errorNote: BLS_REGISTER_PORTAL_PASSWORD_EMAIL_ERROR_MESSAGE,
          });
          return this.safeFail(
            BLS_REGISTER_PORTAL_PASSWORD_EMAIL_ERROR_CODE,
            BLS_REGISTER_PORTAL_PASSWORD_EMAIL_ERROR_MESSAGE,
            this.resolveStoredEvidencePath(
              evidenceRelativePath,
              evidenceAbsolutePath,
            ),
            autofillRunLinked,
          );
        }

        try {
          this.logger.log(
            `bls_register_client phase=portal_password_email_wait start workflowId=${workflowId}`,
          );
          const latest = await this.mailProvider.waitLatestMessage({
            contextKey: workflowId,
            token: mailToken,
            timeoutMs: MAILTM_WAIT_FOR_EMAIL_MS,
            unreadOnly: true,
            excludeMessageIds: otpMessageId ? [otpMessageId] : [],
          });
          const extracted = this.mailProvider.extractPortalPassword({
            body: latest.body,
          });
          if (!extracted.ok) {
            throw new Error(extracted.reason);
          }
          const portalPassword = extracted.password;
          portalPasswordPlain = portalPassword;
          await this.secretVault.persistSecret({
            workflowId,
            applicationId,
            purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD_INITIAL,
            plain: portalPassword,
          });
          await this.secretVault.persistSecret({
            workflowId,
            applicationId,
            purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
            plain: portalPassword,
          });
          this.logger.log(
            `bls_register_client phase=portal_password_email_wait success workflowId=${workflowId} source=${extracted.source}`,
          );
        } catch (pwdErr) {
          const detail =
            pwdErr instanceof Error
              ? pwdErr.message
              : BLS_REGISTER_PORTAL_PASSWORD_EMAIL_ERROR_MESSAGE;
          this.logger.error(
            `bls_register_client phase=portal_password_email_wait failure ${detail}`,
          );
          if (temporaryMailboxCleanup) {
            await this.mailProvider
              .deleteAccount(temporaryMailboxCleanup)
              .catch(() => undefined);
            temporaryMailboxCleanup = undefined;
            temporaryMailboxPassword = undefined;
          }
          await this.terminalizeLinkedRun({
            runId: linked.runId,
            ok: false,
            relativePath: evidenceRelativePath,
            absolutePath: evidenceAbsolutePath,
            errorNote: BLS_REGISTER_PORTAL_PASSWORD_EMAIL_ERROR_MESSAGE,
          });
          return this.safeFail(
            BLS_REGISTER_PORTAL_PASSWORD_EMAIL_ERROR_CODE,
            BLS_REGISTER_PORTAL_PASSWORD_EMAIL_ERROR_MESSAGE,
            this.resolveStoredEvidencePath(
              evidenceRelativePath,
              evidenceAbsolutePath,
            ),
            autofillRunLinked,
          );
        } finally {
          portalPasswordPlain = undefined;
        }
      }

      const retainMailbox = shouldRetainMailTmMailboxAfterOtp(
        fill.emailOtpOk,
        Boolean(temporaryMailboxCleanup),
      );
      if (retainMailbox && temporaryMailboxCleanup) {
        const passwordPlain = temporaryMailboxPassword?.trim() ?? '';
        const tokenPlain = temporaryMailboxCleanup.token?.trim() ?? '';
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
        temporaryMailboxCleanup = undefined;
        temporaryMailboxPassword = undefined;
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
        return {
          ok: true,
          verifiedExternalState: true,
          autofillRunLinked,
        };
      }

      if (fill.errorCode?.trim()) {
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
          fill.errorCode.trim(),
          failMessage,
          this.resolveStoredEvidencePath(
            evidenceRelativePath,
            evidenceAbsolutePath,
          ),
          autofillRunLinked,
        );
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
          autofillRunLinked,
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
        autofillRunLinked,
      );
    } catch (err) {
      if (context.abortSignal?.aborted) {
        return await this.abortWithLinkedRunTerminalize({
          linkedRunId,
          evidenceRelativePath,
          evidenceAbsolutePath,
          autofillRunLinked,
        });
      }
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
        autofillRunLinked,
      );
    } finally {
      portalPasswordPlain = undefined;
      if (!accountRetained && temporaryMailboxCleanup) {
        await this.mailProvider.deleteAccount(temporaryMailboxCleanup).catch(() => undefined);
      }
      temporaryMailboxPassword = undefined;
      if (lease) {
        await lease.release().catch(() => undefined);
      }
    }
  }

  private safeFail(
    errorCode: string,
    errorMessage: string,
    evidenceRelativePath?: string | null,
    autofillRunLinked?: BlsAutofillRunLinkedMetadata,
  ): BlsClientResult {
    return {
      ok: false,
      errorClass: BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT,
      errorCode,
      errorMessage,
      ...(evidenceRelativePath !== undefined
        ? { evidenceRelativePath }
        : {}),
      ...(autofillRunLinked ? { autofillRunLinked } : {}),
    };
  }

  /**
   * Abort result + DEC-005 best-effort terminalize when linked runId is known.
   * Missing runId → no-op; persist soft-fails inside terminalizeLinkedRun.
   * Resume reconciler remains the fallback for unlinked / crash paths.
   */
  private async abortWithLinkedRunTerminalize(input: {
    linkedRunId?: string;
    evidenceRelativePath: string | null;
    evidenceAbsolutePath?: string;
    autofillRunLinked?: BlsAutofillRunLinkedMetadata;
  }): Promise<BlsClientResult> {
    if (input.linkedRunId) {
      await this.terminalizeLinkedRun({
        runId: input.linkedRunId,
        ok: false,
        relativePath: input.evidenceRelativePath,
        absolutePath: input.evidenceAbsolutePath,
        errorNote: BLS_WORKFLOW_ABORT_ERROR_MESSAGE,
      });
    }
    return {
      ...buildBlsClientAbortResult(),
      ...(input.autofillRunLinked
        ? { autofillRunLinked: input.autofillRunLinked }
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
