import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AppEnv } from '../config';
import { uid } from '../../shared/utils';
import {
  createMailSlurpInbox,
  deleteMailSlurpInbox,
  type MailSlurpInboxHandle,
} from '../mailslurp';
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
  PORTAL_AUTOFILL_RUN_LIST_DEFAULT_LIMIT,
} from './constants';
import type { IPortalAutofillService } from './interfaces';
import { PortalConfigService } from './portal-config.service';
import { PortalDataService } from './portal-data.service';
import { PortalFieldMapperService } from './portal-field-mapper.service';
import { PortalFillService } from './portal-fill.service';
import type {
  AutofillEvidence,
  MappingResult,
  PortalAutofillHttpInput,
  PortalAutofillHttpOutcome,
  PortalAutofillRunListResponse,
} from './types';
import {
  buildEvidenceAbsolutePath,
  buildPortalAutofillScreenshotDownloadPath,
  buildReport,
  ensureEvidenceDir,
  evidenceFileExists,
  mapAutofillReportToHttpOutcome,
  mapPortalAutofillRunListItem,
  mappingOk,
  openEvidenceStream,
  resolveEvidenceAbsolutePath,
  unlinkEvidenceBestEffort,
} from './utils';
import { buildCapMonsterNotes } from './utils/build-cap-monster-notes.util';
import { buildMailSlurpOtpNotes } from './utils/build-mailslurp-otp-notes.util';
import { resolveUploadDir } from '../apps/utils';

/**
 * Orchestrates config → DB load → map → fill → report for the HTTP API
 * (portal-autofill-api DEC-001 / DEC-003). CLI / map-check removed.
 * Evidence capture + persist for HTTP path (portal-autofill-screenshot-evidence).
 * Staff list-by-application (portal-autofill-evidence-ui DEC-001 / DEC-004).
 * Optional Webshare proxy lease around fill (webshare-portal-proxy DEC-003).
 * MailSlurp OTP: arm when CapMonster + MailSlurp keys set (DEC-001 / DEC-008).
 */
@Injectable()
export class PortalAutofillService implements IPortalAutofillService {
  private readonly logger = new Logger(PortalAutofillService.name);
  private readonly uploadDir: string;

  constructor(
    private readonly configService: PortalConfigService,
    private readonly dataService: PortalDataService,
    private readonly mapper: PortalFieldMapperService,
    private readonly fillService: PortalFillService,
    private readonly proxyLeaseService: PortalProxyLeaseService,
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
   * When Webshare proxying is enabled: acquire after mapping OK, release in finally.
   * When OTP path armed: create MailSlurp inbox before map/fill; delete in finally.
   */
  async runForHttp(
    input: PortalAutofillHttpInput,
  ): Promise<PortalAutofillHttpOutcome> {
    const config = await this.configService.load();

    if (!config.portalBaseUrl) {
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
      throw new HttpException(
        err instanceof Error
          ? err.message
          : 'Invalid portal configuration',
        HttpStatus.BAD_REQUEST,
      );
    }

    const loaded = await this.dataService.load({
      applicationId: input.applicationId,
      applicantId: input.applicantId,
    });

    const capMonsterKey = config.capMonsterApiKey?.trim() ?? '';
    const mailSlurpKey = config.mailSlurpApiKey?.trim() ?? '';
    const otpPathArmed =
      capMonsterKey.length > 0 && mailSlurpKey.length > 0;

    let lease: PortalProxyLease | undefined;
    let mailSlurpInbox: MailSlurpInboxHandle | undefined;
    let mailSlurpCleanup:
      | { apiKey: string; inboxId: string }
      | undefined;
    let inboxDeleted: boolean | undefined;
    let inboxDeleteWarn: string | undefined;

    try {
      if (otpPathArmed) {
        try {
          mailSlurpInbox = await createMailSlurpInbox({
            apiKey: mailSlurpKey,
          });
          mailSlurpCleanup = {
            apiKey: mailSlurpKey,
            inboxId: mailSlurpInbox.id,
          };
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'MailSlurp createInbox failed';
          this.logger.error(message);
          const failedMapping: MappingResult = {
            applicationId: loaded.application.id,
            applicantId: loaded.applicant.id,
            fields: [],
            ok: false,
            metadata: {
              nameMappingProvisional: true,
              notes: [
                message,
                ...buildMailSlurpOtpNotes({
                  otpPathArmed: true,
                  emailFromMailSlurp: false,
                  emailOtpTouched: false,
                  mailSlurpOtpAttempted: false,
                  error: message,
                }),
              ],
            },
          };
          const report = buildReport(failedMapping);
          return mapAutofillReportToHttpOutcome({
            report,
            mappingAborted: true,
            browserHardFailure: false,
          });
        }
      }

      const mapping = this.mapper.mapFields(
        loaded.application,
        loaded.applicant,
        mailSlurpInbox
          ? { emailOverride: mailSlurpInbox.emailAddress }
          : undefined,
      );

      if (!mapping.ok) {
        const report = buildReport(mapping);
        return mapAutofillReportToHttpOutcome({
          report,
          mappingAborted: true,
          browserHardFailure: false,
        });
      }

      if (config.webshareProxyMisconfigured) {
        throw new HttpException(
          WEBSHARE_PROXY_MSG_MISCONFIGURED,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (config.webshareProxyEnabled) {
        try {
          lease = await this.proxyLeaseService.acquire(config);
        } catch (err) {
          throw this.mapProxyAcquireFailure(err);
        }
      }

      const runId = uid('paf');
      const { relativePath, absolutePath } = buildEvidenceAbsolutePath(
        input.applicationId,
        runId,
        this.uploadDir,
      );
      ensureEvidenceDir(absolutePath);

      const fill = await this.fillService.fillRegisterForm({
        targetUrl,
        mapping,
        headed,
        screenshotPath: absolutePath,
        capMonsterApiKey: config.capMonsterApiKey,
        browserProxy: lease?.browserProxy,
        mailSlurpApiKey: otpPathArmed ? mailSlurpKey : undefined,
        mailSlurpInboxId: mailSlurpInbox?.id,
      });

      // Prefer delete before notes so soft-fail is visible; finally is backup.
      if (mailSlurpCleanup) {
        const del = await deleteMailSlurpInbox(mailSlurpCleanup);
        inboxDeleted = del.deleted;
        inboxDeleteWarn = del.warnMessage;
        if (del.warnMessage) {
          this.logger.warn(del.warnMessage);
        }
        mailSlurpCleanup = undefined;
      }

      const mailSlurpNotes = buildMailSlurpOtpNotes({
        otpPathArmed,
        emailFromMailSlurp: Boolean(mailSlurpInbox),
        emailOtpTouched: fill.emailOtpTouched,
        mailSlurpOtpAttempted: fill.mailSlurpOtpAttempted,
        mailSlurpOtpOk: fill.mailSlurpOtpOk,
        inboxDeleted,
        inboxDeleteWarn,
        error: fill.error,
      });

      if (!fill.navigationOk) {
        unlinkEvidenceBestEffort(absolutePath);
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
              ...mailSlurpNotes,
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
            ...mailSlurpNotes,
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
      const createdAt = new Date();
      const pngPresent = evidenceFileExists(absolutePath);
      let captureOk = pngPresent;
      let storedRelative: string | null = pngPresent ? relativePath : null;
      let errorNote: string | null = pngPresent
        ? null
        : 'Screenshot file missing after fill';

      try {
        await this.runRepo.save({
          id: runId,
          applicationId: input.applicationId,
          applicantId: input.applicantId,
          screenshotRelativePath: storedRelative,
          captureStatus: captureOk
            ? PORTAL_AUTOFILL_CAPTURE_STATUS.CAPTURED
            : PORTAL_AUTOFILL_CAPTURE_STATUS.CAPTURE_FAILED,
          reportOk: report.ok,
          triggeredByUserId: input.triggeredByUserId ?? null,
          errorNote,
          createdAt,
        });
      } catch {
        unlinkEvidenceBestEffort(absolutePath);
        captureOk = false;
        storedRelative = null;
        errorNote = 'Failed to persist evidence record';
      }

      const evidence: AutofillEvidence = {
        runId,
        applicationId: input.applicationId,
        applicantId: input.applicantId,
        createdAt: createdAt.toISOString(),
        captureOk,
        relativePath: storedRelative,
        downloadPath: buildPortalAutofillScreenshotDownloadPath(runId),
        ...(errorNote ? { error: errorNote } : {}),
      };
      report.evidence = evidence;

      return mapAutofillReportToHttpOutcome({
        report,
        mappingAborted: false,
        browserHardFailure: false,
      });
    } finally {
      if (lease) {
        await lease.release().catch(() => undefined);
      }
      if (mailSlurpCleanup) {
        const del = await deleteMailSlurpInbox(mailSlurpCleanup);
        if (del.warnMessage) {
          this.logger.warn(del.warnMessage);
        }
      }
    }
  }

  /**
   * List portal autofill runs for an application (DEC-001 / DEC-004).
   * Newest-first; bounded by `limit`. Unknown application → 404.
   */
  async listRunsForApplication(
    applicationId: string,
    limit: number = PORTAL_AUTOFILL_RUN_LIST_DEFAULT_LIMIT,
  ): Promise<PortalAutofillRunListResponse> {
    const app = await this.appsRepo.findOne({ where: { id: applicationId } });
    if (!app) {
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    }

    const rows = await this.runRepo.find({
      where: { applicationId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return { runs: rows.map(mapPortalAutofillRunListItem) };
  }

  /**
   * Stream a captured evidence PNG for staff download (DEC-003 / REQ-007).
   * Resolves only under managed UPLOAD_DIR (no path traversal).
   */
  async getScreenshotStream(
    runId: string,
  ): Promise<{ stream: NodeJS.ReadableStream; filename: string }> {
    const run = await this.runRepo.findOne({ where: { id: runId } });
    if (!run?.screenshotRelativePath) {
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
