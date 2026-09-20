import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import type { AppEnv } from '../config';
import { uid } from '../../shared/utils';
import {
  MailTmService,
} from '../mailtm';
import {
  isWebshareProxyError,
  PortalProxyLeaseService,
  type PortalProxyLease,
  WEBSHARE_PROXY_MSG_MISCONFIGURED,
} from '../webshare';
import { Application } from '../database/entities/application.entity';
import { PortalAutofillRun } from '../database/entities/portal-autofill-run.entity';
import {
  PORTAL_AUTOFILL_CAPTURE_STATUS,
  PORTAL_AUTOFILL_LOCK_HEARTBEAT_MS,
  PORTAL_AUTOFILL_LOCK_STALE_MS,
  PORTAL_AUTOFILL_MSG_RUN_LOCKED,
  PORTAL_AUTOFILL_PIPELINE_STAGE,
  PORTAL_AUTOFILL_RETRY_MSG_UNSUPPORTED_COUNTRY,
  PORTAL_AUTOFILL_RUN_LIST_DEFAULT_LIMIT,
  PORTAL_AUTOFILL_RUN_STATUS,
} from './constants';
import type { IPortalAutofill } from './interfaces';
import { PortalConfigService } from './portal-config.service';
import { PortalDataService } from './portal-data.service';
import { PortalFieldMapperService } from './portal-field-mapper.service';
import { PortalFillService } from './portal-fill.service';
import { PortalSiteAdapterRegistry } from './portal-site-adapter.registry';
import type {
  AutofillEvidence,
  MappingResult,
  PortalAutofillCaptchaRestore,
  PortalAutofillCheckpointPatch,
  PortalAutofillHttpInput,
  PortalAutofillHttpOutcome,
  PortalAutofillRunListResponse,
  PortalClientPortalProgress,
} from './types';
import {
  buildEvidenceAbsolutePath,
  buildPortalAutofillCaptchaRestore,
  buildPortalAutofillEmptyRetryEligibility,
  buildPortalAutofillLockOwner,
  buildPortalAutofillScreenshotDownloadPath,
  buildReport,
  computePortalAutofillRetryEligibility,
  ensureEvidenceDir,
  evidenceFileExists,
  formatPortalLogContext,
  isPortalAutofillLockStale,
  isPortalAutofillRunResumeEligible,
  listApplicationApplicantIds,
  mapAutofillReportToHttpOutcome,
  mapPortalAutofillRunListItem,
  mapPortalClientPortalProgress,
  mappingOk,
  openEvidenceStream,
  resolveEvidenceAbsolutePath,
  resolvePortalAutofillEligibilityApplicantId,
  resolvePortalSiteOutcomeForAdapter,
  unlinkEvidenceBestEffort,
} from './utils';
import { buildCapMonsterNotes } from './utils/build-cap-monster-notes.util';
import { buildEmailOtpNotes } from './utils/build-email-otp-notes.util';
import { resolveUploadDir } from '../apps/utils';

/**
 * Orchestrates config → DB load → map → fill → report for the HTTP API
 * (portal-autofill-api DEC-001 / DEC-003). CLI / map-check removed.
 * Evidence capture + persist for HTTP path (portal-autofill-screenshot-evidence).
 * Staff list-by-application (portal-autofill-evidence-ui DEC-001 / DEC-004).
 * Optional Webshare proxy lease around fill (webshare-portal-proxy DEC-003).
 * Email OTP: arm when CapMonster key ∧ config.emailOtpEnabled ∧
 * non-empty MAILTM_API_BASE_URL (portal-email-otp-mailtm DEC-004;
 * product enable hardcoded true in portal-config).
 */
@Injectable()
export class PortalAutofillService implements IPortalAutofill {
  private readonly logger = new Logger(PortalAutofillService.name);
  private readonly uploadDir: string;

  constructor(
    private readonly configService: PortalConfigService,
    private readonly dataService: PortalDataService,
    private readonly mapper: PortalFieldMapperService,
    private readonly fillService: PortalFillService,
    private readonly proxyLeaseService: PortalProxyLeaseService,
    private readonly mailTm: MailTmService,
    private readonly siteAdapters: PortalSiteAdapterRegistry,
    @InjectRepository(PortalAutofillRun)
    private readonly runRepo: Repository<PortalAutofillRun>,
    @InjectRepository(Application)
    private readonly appsRepo: Repository<Application>,
    config: ConfigService<AppEnv, true>,
  ) {
    this.uploadDir = resolveUploadDir(
      config.get('UPLOAD_DIR', { infer: true }),
    );
  }

  /**
   * Authenticated HTTP autofill (DEC-001–009): DB load → map → live URL fill → report.
   * Does not emit stdout; maps outcomes to HTTP statuses via controller.
   * Assigns managed screenshot path, persists run row, attaches `evidence` (DEC-004–008).
   * Durable early create + always-terminal persist (portal-autofill-durable-resume REQ-002 / REQ-016).
   * Checkpoint / heartbeat sinks + POST resume / supersede / live-lock 409 (REQ-003–007 / REQ-014–015).
   * When Webshare proxying is enabled: acquire after mapping OK, release in finally.
   * When OTP path armed: create Mail.tm account before map/fill; delete in finally.
   * On resume: always re-navigate; fresh Mail.tm when OTP armed; restore captcha budgets only (DEC-002/004/005).
   */
  async runForHttp(
    input: PortalAutofillHttpInput,
  ): Promise<PortalAutofillHttpOutcome> {
    const { applicationId, applicantId } = input;
    let runId: string | undefined;
    let runCreatedAt: Date | undefined;
    let workflowEnded = false;

    const logPrefix = () =>
      formatPortalLogContext({ applicationId, applicantId, runId });

    const endWorkflow = (
      level: 'log' | 'error',
      outcome: string,
      detail?: string,
    ) => {
      if (workflowEnded) {
        return;
      }
      workflowEnded = true;
      const msg = `${logPrefix()} workflow.end outcome=${outcome}${
        detail ? ` detail=${detail}` : ''
      }`;
      if (level === 'error') {
        this.logger.error(msg);
      } else {
        this.logger.log(msg);
      }
    };

    this.logger.log(`${logPrefix()} workflow.start`);

    let lease: PortalProxyLease | undefined;
    let mailTmCleanup:
      | { accountId: string; token: string }
      | undefined;
    let accountDeleted: boolean | undefined;
    let accountDeleteWarn: string | undefined;

    try {
      const config = await this.configService.load();
      this.logger.log(
        `${logPrefix()} stage=config_ready portalBaseUrlSet=${Boolean(
          config.portalBaseUrl,
        )}`,
      );

      if (!config.portalBaseUrl) {
        endWorkflow('error', 'failure', 'portal_base_url_missing');
        throw new HttpException(
          'Portal address is not set (VISES_PORTAL_BASE_URL)',
          HttpStatus.BAD_REQUEST,
        );
      }

      const headed = this.configService.resolveHeaded();

      let targetUrl: string;
      try {
        targetUrl = this.configService.resolvePortalRegisterUrl(config);
      } catch (err) {
        const detail =
          err instanceof Error ? err.message : 'invalid_portal_configuration';
        endWorkflow('error', 'failure', detail);
        throw new HttpException(
          err instanceof Error
            ? err.message
            : 'Invalid portal configuration',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`${logPrefix()} stage=load start`);
      const loaded = await this.dataService.load({
        applicationId,
        applicantId,
      });
      this.logger.log(`${logPrefix()} stage=load success`);

      const siteAdapter = this.siteAdapters.resolve({
        submitCountry: loaded.application.submitCountry ?? '',
      });
      if (!siteAdapter) {
        endWorkflow('error', 'failure', 'unsupported_submit_country');
        throw new HttpException(
          PORTAL_AUTOFILL_RETRY_MSG_UNSUPPORTED_COUNTRY,
          HttpStatus.BAD_REQUEST,
        );
      }
      this.logger.log(
        `${logPrefix()} decision siteAdapter=${siteAdapter.siteId}`,
      );

      const capMonsterKey = config.capMonsterApiKey?.trim() ?? '';
      const capMonsterEnabled = capMonsterKey.length > 0;
      const mailTmBaseUrl = config.mailTmApiBaseUrl?.trim() ?? '';
      const mailTmBaseUrlConfigured = mailTmBaseUrl.length > 0;
      const otpPathArmed =
        capMonsterEnabled &&
        config.emailOtpEnabled &&
        mailTmBaseUrlConfigured;

      this.logger.log(
        `${logPrefix()} decision CapMonster enabled=${capMonsterEnabled}`,
      );
      this.logger.log(
        `${logPrefix()} decision emailOtpPath armed=${otpPathArmed} reason=${
          otpPathArmed
            ? 'capMonster_and_emailOtpEnabled_and_mailtm_base_url'
            : !capMonsterEnabled
              ? 'capMonster_off'
              : !config.emailOtpEnabled
                ? 'emailOtp_disabled'
                : 'mailtm_base_url_empty'
        }`,
      );

      this.logger.log(`${logPrefix()} stage=mapping start`);
      const mapping = this.mapper.mapFields(
        loaded.application,
        loaded.applicant,
        otpPathArmed ? { otpPathArmed: true } : undefined,
      );

      if (!mapping.ok) {
        this.logger.log(`${logPrefix()} decision mapping=abort`);
        const report = buildReport(mapping);
        endWorkflow('log', 'mapping_abort');
        return mapAutofillReportToHttpOutcome({
          report,
          mappingAborted: true,
          browserHardFailure: false,
        });
      }

      this.logger.log(`${logPrefix()} decision mapping=continue_to_browser`);

      if (config.webshareProxyMisconfigured) {
        endWorkflow('error', 'failure', 'webshare_proxy_misconfigured');
        throw new HttpException(
          WEBSHARE_PROXY_MSG_MISCONFIGURED,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (config.webshareProxyEnabled) {
        try {
          lease = await this.proxyLeaseService.acquire(config);
          this.logger.log(
            `${logPrefix()} decision webshareProxy=leased`,
          );
        } catch (err) {
          endWorkflow('error', 'failure', 'webshare_proxy_acquire_failed');
          throw this.mapProxyAcquireFailure(err);
        }
      } else {
        this.logger.log(
          `${logPrefix()} decision webshareProxy=skipped`,
        );
      }

      const lockOwner = buildPortalAutofillLockOwner();
      let captchaRestore: PortalAutofillCaptchaRestore | undefined;

      const resolved = await this.resolveRunForHttp({
        applicationId,
        applicantId,
        triggeredByUserId: input.triggeredByUserId ?? null,
        supersede: input.supersede === true,
        lockOwner,
        logPrefix,
      });
      runId = resolved.runId;
      runCreatedAt = resolved.createdAt;
      captchaRestore = resolved.captchaRestore;

      const { relativePath, absolutePath } = buildEvidenceAbsolutePath(
        applicationId,
        runId,
        this.uploadDir,
      );
      ensureEvidenceDir(absolutePath);

      const navigatingAt = new Date();
      await this.runRepo.update(
        { id: runId },
        {
          pipelineStage: PORTAL_AUTOFILL_PIPELINE_STAGE.NAVIGATING,
          lockHeartbeatAt: navigatingAt,
          updatedAt: navigatingAt,
          ...(captchaRestore?.countAbandonedInflightAttempt
            ? {
                captchaAttempt: captchaRestore.attempts,
                capmonsterInflightTaskId: null,
              }
            : {}),
        },
      );

      const persistCheckpoint = async (
        patch: PortalAutofillCheckpointPatch,
      ): Promise<void> => {
        const now = new Date();
        await this.runRepo.update(
          { id: runId as string },
          {
            ...(patch.pipelineStage !== undefined
              ? { pipelineStage: patch.pipelineStage }
              : {}),
            ...(patch.fieldProgress !== undefined
              ? { fieldProgressJson: patch.fieldProgress }
              : {}),
            ...(patch.captchaAttempt !== undefined
              ? { captchaAttempt: patch.captchaAttempt }
              : {}),
            ...(patch.captchaBudgetDeadlineAt !== undefined
              ? { captchaBudgetDeadlineAt: patch.captchaBudgetDeadlineAt }
              : {}),
            ...(patch.capmonsterCb !== undefined
              ? {
                  capmonsterCbState: patch.capmonsterCb.state,
                  capmonsterCbConsecutiveFailures:
                    patch.capmonsterCb.consecutiveFailures,
                  capmonsterCbOpenedAt: patch.capmonsterCb.openedAt,
                }
              : {}),
            ...(patch.capmonsterPermanentFailed !== undefined
              ? {
                  capmonsterPermanentFailed: patch.capmonsterPermanentFailed,
                }
              : {}),
            ...(patch.capmonsterInflightTaskId !== undefined
              ? {
                  capmonsterInflightTaskId: patch.capmonsterInflightTaskId,
                }
              : {}),
            lockHeartbeatAt: now,
            updatedAt: now,
          },
        );
      };

      const bumpHeartbeat = async (): Promise<void> => {
        const now = new Date();
        await this.runRepo.update(
          { id: runId as string },
          { lockHeartbeatAt: now, updatedAt: now },
        );
      };

      const heartbeatTimer = setInterval(() => {
        void bumpHeartbeat().catch(() => undefined);
      }, PORTAL_AUTOFILL_LOCK_HEARTBEAT_MS);

      this.logger.log(`${logPrefix()} stage=fill start`);
      let fill;
      try {
        fill = await this.fillService.fillRegisterForm({
          targetUrl,
          mapping,
          headed,
          screenshotPath: absolutePath,
          capMonsterApiKey: config.capMonsterApiKey,
          browserProxy: lease?.browserProxy,
          otpPathArmed,
          runId,
          captchaRestore,
          checkpoint: {
            onCheckpoint: persistCheckpoint,
            onHeartbeat: bumpHeartbeat,
          },
        });
      } finally {
        clearInterval(heartbeatTimer);
      }
      this.logger.log(
        `${logPrefix()} stage=fill complete navigationOk=${fill.navigationOk}`,
      );

      if (fill.mailTmCleanup) {
        mailTmCleanup = fill.mailTmCleanup;
      }
      const emailFromMailTm = Boolean(fill.mailTmCleanup);

      // Prefer delete before notes so soft-fail is visible; finally is backup.
      if (mailTmCleanup) {
        const del = await this.mailTm.deleteAccount(mailTmCleanup);
        accountDeleted = del.ok;
        accountDeleteWarn = del.warnMessage;
        if (del.warnMessage) {
          this.logger.warn(del.warnMessage);
        }
        mailTmCleanup = undefined;
      }

      const emailOtpNotes = buildEmailOtpNotes({
        otpPathArmed,
        emailFromMailTm,
        emailOtpTouched: fill.emailOtpTouched,
        emailOtpAttempted: fill.emailOtpAttempted,
        emailOtpOk: fill.emailOtpOk,
        resendAttempts: fill.mailTmResendAttempts,
        mailTmCircuitOpen: fill.mailTmCircuitOpen,
        accountDeleted,
        accountDeleteWarn,
        error: fill.error,
      });

      if (!fill.navigationOk) {
        unlinkEvidenceBestEffort(absolutePath);
        const hardFailReason = fill.error ?? 'browser_hard_failure';
        try {
          await this.persistRunTerminal(runId, {
            status: PORTAL_AUTOFILL_RUN_STATUS.FAILED,
            captureStatus: PORTAL_AUTOFILL_CAPTURE_STATUS.CAPTURE_FAILED,
            reportOk: false,
            screenshotRelativePath: null,
            errorNote: hardFailReason.slice(0, 500),
            terminalReason: hardFailReason.slice(0, 500),
          });
        } catch {
          this.logger.warn(
            `${logPrefix()} stage=persist failed detail=hard_failure_terminal`,
          );
        }
        const failedMapping: MappingResult = {
          ...mapping,
          fields: fill.fields,
          ok: false,
          metadata: {
            ...mapping.metadata,
            notes: [
              ...mapping.metadata.notes,
              fill.error ?? 'navigation failed',
              ...buildCapMonsterNotes(fill, config.capMonsterApiKey),
              ...emailOtpNotes,
              config.capMonsterApiKey
                ? 'CAPTCHA guard: CapMonster enabled (ignore captcha clues; DEC-005)'
                : 'CAPTCHA guard active (CON-007)',
              fill.verifyClicked
                ? '#btnVerify clicked'
                : 'Verify not clicked',
            ],
          },
        };
        const report = buildReport(failedMapping);
        endWorkflow('error', 'hard_failure', hardFailReason);
        return mapAutofillReportToHttpOutcome({
          report,
          mappingAborted: false,
          browserHardFailure: true,
        });
      }

      const postMapping: MappingResult = {
        ...mapping,
        fields: fill.fields,
        ok: mappingOk(fill.fields),
        metadata: {
          ...mapping.metadata,
          notes: [
            ...mapping.metadata.notes,
            fill.verifyClicked
              ? '#btnVerify clicked after fill (CapMonster path)'
              : 'fill-only: #btnVerify not clicked; EmailOtp not filled (DEC-007)',
            ...buildCapMonsterNotes(fill, config.capMonsterApiKey),
            ...emailOtpNotes,
            config.capMonsterApiKey
              ? 'CAPTCHA guard: CapMonster enabled (ignore captcha clues; DEC-005)'
              : 'CAPTCHA guard active (CON-007)',
            fill.usedStandIn
              ? 'HTML fixture Kendo stand-in used (RISK-009 / DEC-006) — live Kendo may differ'
              : 'navigated without __visesKendoStandIn (live or alternate page)',
            fill.countryCodeObserved
              ? `CountryCode observed=${fill.countryCodeObserved}`
              : 'CountryCode not observed',
            fill.screenshotPath
              ? `screenshot=${fill.screenshotPath}`
              : 'no screenshot',
            headed ? 'browser headed=true' : 'browser headed=false',
          ],
        },
      };

      const report = buildReport(postMapping);
      const createdAt = runCreatedAt ?? new Date();
      const pngPresent = evidenceFileExists(absolutePath);
      let captureOk = pngPresent;
      let storedRelative: string | null = pngPresent ? relativePath : null;
      let errorNote: string | null = pngPresent
        ? null
        : 'Screenshot file missing after fill';

      try {
        await this.persistRunTerminal(runId, {
          status: PORTAL_AUTOFILL_RUN_STATUS.SUCCEEDED,
          screenshotRelativePath: storedRelative,
          captureStatus: captureOk
            ? PORTAL_AUTOFILL_CAPTURE_STATUS.CAPTURED
            : PORTAL_AUTOFILL_CAPTURE_STATUS.CAPTURE_FAILED,
          reportOk: report.ok,
          errorNote,
          terminalReason: null,
        });
        this.logger.log(
          `${logPrefix()} stage=persist success captureOk=${captureOk} reportOk=${report.ok}`,
        );
      } catch {
        unlinkEvidenceBestEffort(absolutePath);
        captureOk = false;
        storedRelative = null;
        errorNote = 'Failed to persist evidence record';
        this.logger.warn(
          `${logPrefix()} stage=persist failed detail=evidence_record`,
        );
      }

      const evidence: AutofillEvidence = {
        runId,
        applicationId,
        applicantId,
        createdAt: createdAt.toISOString(),
        captureOk,
        relativePath: storedRelative,
        downloadPath: buildPortalAutofillScreenshotDownloadPath(runId),
        ...(errorNote ? { error: errorNote } : {}),
      };
      report.evidence = evidence;

      endWorkflow(
        'log',
        report.ok ? 'success' : 'completed_with_field_errors',
        `captureOk=${captureOk}`,
      );
      return mapAutofillReportToHttpOutcome({
        report,
        mappingAborted: false,
        browserHardFailure: false,
      });
    } catch (err) {
      if (runId) {
        const detail =
          err instanceof Error ? err.message : 'unexpected_failure';
        await this.persistRunTerminal(runId, {
          status: PORTAL_AUTOFILL_RUN_STATUS.FAILED,
          captureStatus: PORTAL_AUTOFILL_CAPTURE_STATUS.CAPTURE_FAILED,
          reportOk: false,
          errorNote: detail.slice(0, 500),
          terminalReason: detail.slice(0, 500),
        }).catch(() => undefined);
      }
      if (!workflowEnded) {
        const detail =
          err instanceof Error ? err.message : 'unexpected_failure';
        endWorkflow('error', 'failure', detail);
      }
      throw err;
    } finally {
      if (lease) {
        await lease.release().catch(() => undefined);
      }
      if (mailTmCleanup) {
        const del = await this.mailTm.deleteAccount(mailTmCleanup);
        if (del.warnMessage) {
          this.logger.warn(del.warnMessage);
        }
      }
    }
  }

  /**
   * List portal autofill runs for an application (DEC-007 / REQ-006 / REQ-007).
   * Includes `in_progress`; legacy null `status` remains listable as terminal.
   * Returns pair-scoped `retryEligibility` (query `applicantId`, else newest
   * in_progress / newest run / first application applicant).
   * Newest-first; bounded by `limit`. Unknown application → 404.
   * Does not start a second executor (NFR-004).
   */
  async listRunsForApplication(
    applicationId: string,
    limit: number = PORTAL_AUTOFILL_RUN_LIST_DEFAULT_LIMIT,
    applicantId?: string,
  ): Promise<PortalAutofillRunListResponse> {
    const app = await this.appsRepo.findOne({ where: { id: applicationId } });
    if (!app) {
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    }

    const nowMs = Date.now();
    const rows = await this.runRepo.find({
      where: { applicationId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    const applicationApplicantIds = listApplicationApplicantIds(app.applicants);
    const eligibilityApplicantId = resolvePortalAutofillEligibilityApplicantId({
      queryApplicantId: applicantId,
      runs: rows.map((r) => ({
        applicantId: r.applicantId,
        status: r.status,
      })),
      applicationApplicantIds,
    });

    if (eligibilityApplicantId == null) {
      return {
        runs: rows.map((r) => mapPortalAutofillRunListItem(r, nowMs)),
        retryEligibility: buildPortalAutofillEmptyRetryEligibility(),
        eligibilityApplicantId: null,
      };
    }

    const config = await this.configService.load();
    const capMonsterKeyConfigured = Boolean(
      config.capMonsterApiKey?.trim().length,
    );

    const inProgressRun = await this.runRepo.findOne({
      where: {
        applicationId,
        applicantId: eligibilityApplicantId,
        status: PORTAL_AUTOFILL_RUN_STATUS.IN_PROGRESS,
      },
      order: { createdAt: 'DESC' },
    });

    const latestTerminalRun = await this.runRepo.findOne({
      where: [
        {
          applicationId,
          applicantId: eligibilityApplicantId,
          status: In([
            PORTAL_AUTOFILL_RUN_STATUS.SUCCEEDED,
            PORTAL_AUTOFILL_RUN_STATUS.FAILED,
            PORTAL_AUTOFILL_RUN_STATUS.ABANDONED,
          ]),
        },
        {
          applicationId,
          applicantId: eligibilityApplicantId,
          status: IsNull(),
        },
      ],
      order: { createdAt: 'DESC' },
    });

    const applicantReady = applicationApplicantIds.includes(
      eligibilityApplicantId,
    );
    const adapterSupported = Boolean(
      this.siteAdapters.resolve({
        submitCountry: app.submitCountry ?? '',
      }),
    );

    const retryEligibility = computePortalAutofillRetryEligibility({
      inProgressRun: inProgressRun
        ? {
            status: inProgressRun.status,
            lockOwner: inProgressRun.lockOwner,
            lockHeartbeatAt: inProgressRun.lockHeartbeatAt,
            captchaBudgetDeadlineAt: inProgressRun.captchaBudgetDeadlineAt,
            capmonsterCbState: inProgressRun.capmonsterCbState,
            capmonsterPermanentFailed: inProgressRun.capmonsterPermanentFailed,
            terminalReason: inProgressRun.terminalReason,
          }
        : null,
      latestTerminalRun: latestTerminalRun
        ? {
            status: latestTerminalRun.status,
            captchaBudgetDeadlineAt: latestTerminalRun.captchaBudgetDeadlineAt,
            capmonsterCbState: latestTerminalRun.capmonsterCbState,
            capmonsterPermanentFailed:
              latestTerminalRun.capmonsterPermanentFailed,
            terminalReason: latestTerminalRun.terminalReason,
          }
        : null,
      applicantReady,
      adapterSupported,
      capMonsterKeyConfigured,
      nowMs,
    });

    return {
      runs: rows.map((r) => mapPortalAutofillRunListItem(r, nowMs)),
      retryEligibility,
      eligibilityApplicantId,
    };
  }

  /**
   * Client-safe portal progress for one application (DEC-007 / REQ-002–005).
   * Uses primary/latest applicant selection; site outcome from adapter (DEC-002).
   */
  async getClientPortalProgress(
    applicationId: string,
  ): Promise<PortalClientPortalProgress> {
    const app = await this.appsRepo.findOne({ where: { id: applicationId } });
    if (!app) {
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    }
    const map = await this.getClientPortalProgressForApps([
      {
        id: app.id,
        submitCountry: app.submitCountry ?? '',
        applicants: app.applicants,
      },
    ]);
    return map.get(app.id)!;
  }

  /**
   * Batch client-safe projections for `GET /apps` embed (NFR-005 / A-API-1).
   * Never includes screenshot URLs, CB dumps, or secrets (NFR-002).
   */
  async getClientPortalProgressForApps(
    apps: ReadonlyArray<{
      id: string;
      submitCountry: string;
      applicants: unknown;
    }>,
  ): Promise<Map<string, PortalClientPortalProgress>> {
    const out = new Map<string, PortalClientPortalProgress>();
    if (apps.length === 0) {
      return out;
    }

    const appIds = apps.map((a) => a.id);
    const rows = await this.runRepo.find({
      where: { applicationId: In(appIds) },
      order: { createdAt: 'DESC' },
    });

    const runsByAppId = new Map<string, PortalAutofillRun[]>();
    for (const row of rows) {
      const list = runsByAppId.get(row.applicationId);
      if (list) {
        list.push(row);
      } else {
        runsByAppId.set(row.applicationId, [row]);
      }
    }

    for (const app of apps) {
      const matchCtx = { submitCountry: app.submitCountry ?? '' };
      const adapter = this.siteAdapters.resolve(matchCtx);
      const siteOutcome = resolvePortalSiteOutcomeForAdapter(adapter, matchCtx);
      const appRuns = runsByAppId.get(app.id) ?? [];
      const applicationApplicantIds = listApplicationApplicantIds(
        app.applicants,
      );
      const eligibilityApplicantId = resolvePortalAutofillEligibilityApplicantId(
        {
          queryApplicantId: undefined,
          runs: appRuns.map((r) => ({
            applicantId: r.applicantId,
            status: r.status,
          })),
          applicationApplicantIds,
        },
      );
      const scopedRuns =
        eligibilityApplicantId == null
          ? []
          : appRuns.filter((r) => r.applicantId === eligibilityApplicantId);

      out.set(
        app.id,
        mapPortalClientPortalProgress({
          dataSaved: true,
          runs: scopedRuns.map((r) => ({
            status: r.status,
            reportOk: r.reportOk,
            fieldProgressJson: r.fieldProgressJson,
          })),
          siteOutcome,
        }),
      );
    }

    return out;
  }

  /**
   * Stream a captured evidence PNG for staff download (DEC-003 / REQ-007 / REQ-012).
   * 404 for `in_progress` / `pending` / missing PNG. Resolves only under UPLOAD_DIR.
   */
  async getScreenshotStream(
    runId: string,
  ): Promise<{ stream: NodeJS.ReadableStream; filename: string }> {
    const run = await this.runRepo.findOne({ where: { id: runId } });
    if (
      !run ||
      run.status === PORTAL_AUTOFILL_RUN_STATUS.IN_PROGRESS ||
      run.captureStatus === PORTAL_AUTOFILL_CAPTURE_STATUS.PENDING ||
      !run.screenshotRelativePath
    ) {
      throw new HttpException('Screenshot not found', HttpStatus.NOT_FOUND);
    }

    let absolutePath: string;
    try {
      absolutePath = resolveEvidenceAbsolutePath(
        run.screenshotRelativePath,
        this.uploadDir,
      );
    } catch {
      throw new HttpException('Screenshot not found', HttpStatus.NOT_FOUND);
    }

    if (!evidenceFileExists(absolutePath)) {
      throw new HttpException('Screenshot not found', HttpStatus.NOT_FOUND);
    }

    return {
      stream: openEvidenceStream(absolutePath),
      filename: `${runId}.png`,
    };
  }

  /**
   * Resolve new vs resume vs supersede for POST (DEC-006 / DEC-009 / DEC-010).
   * Live non-stale lock → 409. Ineligible in_progress → terminalize then new run.
   */
  private async resolveRunForHttp(input: {
    applicationId: string;
    applicantId: string;
    triggeredByUserId: string | null;
    supersede: boolean;
    lockOwner: string;
    logPrefix: () => string;
  }): Promise<{
    runId: string;
    createdAt: Date;
    captchaRestore?: PortalAutofillCaptchaRestore;
  }> {
    const nowMs = Date.now();
    const existing = await this.runRepo.findOne({
      where: {
        applicationId: input.applicationId,
        applicantId: input.applicantId,
        status: PORTAL_AUTOFILL_RUN_STATUS.IN_PROGRESS,
      },
      order: { createdAt: 'DESC' },
    });

    if (existing) {
      const hasLiveOwner =
        typeof existing.lockOwner === 'string' &&
        existing.lockOwner.trim().length > 0;
      const lockLive =
        hasLiveOwner &&
        !isPortalAutofillLockStale(
          existing.lockHeartbeatAt,
          nowMs,
          PORTAL_AUTOFILL_LOCK_STALE_MS,
        );

      if (lockLive) {
        this.logger.warn(
          `${input.logPrefix()} decision resume=blocked reason=live_lock`,
        );
        throw new HttpException(
          PORTAL_AUTOFILL_MSG_RUN_LOCKED,
          HttpStatus.CONFLICT,
        );
      }

      if (input.supersede) {
        await this.persistRunTerminal(existing.id, {
          status: PORTAL_AUTOFILL_RUN_STATUS.ABANDONED,
          captureStatus: PORTAL_AUTOFILL_CAPTURE_STATUS.CAPTURE_FAILED,
          reportOk: false,
          screenshotRelativePath: null,
          errorNote: 'superseded_by_staff',
          terminalReason: 'superseded_by_staff',
        });
        this.logger.log(
          `${input.logPrefix()} decision supersede=true abandonedRunId=${existing.id}`,
        );
      } else {
        const eligible = isPortalAutofillRunResumeEligible({
          status: existing.status,
          capmonsterPermanentFailed: existing.capmonsterPermanentFailed,
          captchaBudgetDeadlineAt: existing.captchaBudgetDeadlineAt,
          capmonsterCbState: existing.capmonsterCbState,
          lockOwner: existing.lockOwner,
          lockHeartbeatAt: existing.lockHeartbeatAt,
          nowMs,
          staleMs: PORTAL_AUTOFILL_LOCK_STALE_MS,
        });

        if (eligible) {
          const captchaRestore = buildPortalAutofillCaptchaRestore(existing);
          const reclaimedAt = new Date();
          await this.runRepo.update(
            { id: existing.id },
            {
              lockOwner: input.lockOwner,
              lockHeartbeatAt: reclaimedAt,
              updatedAt: reclaimedAt,
              pipelineStage: PORTAL_AUTOFILL_PIPELINE_STAGE.PRE_BROWSER,
              captchaAttempt: captchaRestore.attempts,
              capmonsterInflightTaskId: null,
            },
          );
          this.logger.log(
            `${input.logPrefix()} decision resume=true runId=${existing.id} captchaAttempt=${captchaRestore.attempts}`,
          );
          return {
            runId: existing.id,
            createdAt: existing.createdAt,
            captchaRestore,
          };
        }

        const terminalReason = existing.capmonsterPermanentFailed
          ? 'capmonster_permanent_failed'
          : existing.capmonsterCbState === 'open'
            ? 'capmonster_circuit_open'
            : existing.captchaBudgetDeadlineAt != null &&
                nowMs >= existing.captchaBudgetDeadlineAt.getTime()
              ? 'captcha_budget_expired'
              : 'resume_ineligible';
        await this.persistRunTerminal(existing.id, {
          status: PORTAL_AUTOFILL_RUN_STATUS.FAILED,
          captureStatus: PORTAL_AUTOFILL_CAPTURE_STATUS.CAPTURE_FAILED,
          reportOk: false,
          screenshotRelativePath: null,
          errorNote: terminalReason,
          terminalReason,
        });
        this.logger.log(
          `${input.logPrefix()} decision resume=ineligible terminalizedRunId=${existing.id} reason=${terminalReason}`,
        );
      }
    }

    const runId = uid('paf');
    const createdAt = new Date();
    this.logger.log(`${input.logPrefix()} stage=runId_allocated`);
    await this.runRepo.save({
      id: runId,
      applicationId: input.applicationId,
      applicantId: input.applicantId,
      screenshotRelativePath: null,
      captureStatus: PORTAL_AUTOFILL_CAPTURE_STATUS.PENDING,
      reportOk: false,
      triggeredByUserId: input.triggeredByUserId,
      errorNote: null,
      createdAt,
      status: PORTAL_AUTOFILL_RUN_STATUS.IN_PROGRESS,
      pipelineStage: PORTAL_AUTOFILL_PIPELINE_STAGE.PRE_BROWSER,
      updatedAt: createdAt,
      lockOwner: input.lockOwner,
      lockHeartbeatAt: createdAt,
      captchaAttempt: 0,
      captchaBudgetDeadlineAt: null,
      capmonsterCbState: null,
      capmonsterCbConsecutiveFailures: 0,
      capmonsterCbOpenedAt: null,
      capmonsterPermanentFailed: false,
      capmonsterInflightTaskId: null,
      fieldProgressJson: null,
      terminalReason: null,
    });
    this.logger.log(
      `${input.logPrefix()} stage=run_persist status=in_progress stage=${PORTAL_AUTOFILL_PIPELINE_STAGE.PRE_BROWSER}`,
    );

    return {
      runId,
      createdAt,
    };
  }

  /**
   * Mark a durable run terminal and release the execution lock (REQ-016).
   * Best-effort callers may `.catch` — process crash leaves `in_progress` for resume.
   */
  private async persistRunTerminal(
    runId: string,
    patch: {
      status: string;
      captureStatus: string;
      reportOk: boolean;
      screenshotRelativePath?: string | null;
      errorNote?: string | null;
      terminalReason?: string | null;
    },
  ): Promise<void> {
    const updatedAt = new Date();
    await this.runRepo.update(
      { id: runId },
      {
        ...patch,
        pipelineStage: PORTAL_AUTOFILL_PIPELINE_STAGE.TERMINAL,
        lockOwner: null,
        lockHeartbeatAt: null,
        updatedAt,
      },
    );
  }

  /** Map lease/list failures to HTTP (fail closed — never host IP). */
  private mapProxyAcquireFailure(err: unknown): HttpException {
    if (isWebshareProxyError(err)) {
      if (err.code === 'misconfigured') {
        return new HttpException(err.message, HttpStatus.BAD_REQUEST);
      }
      return new HttpException(err.message, HttpStatus.SERVICE_UNAVAILABLE);
    }
    const message =
      err instanceof Error ? err.message : WEBSHARE_PROXY_MSG_MISCONFIGURED;
    return new HttpException(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
