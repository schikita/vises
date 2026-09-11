import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { uid } from '../common/utils';
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

/**
 * Orchestrates config → DB load → map → fill → report for the HTTP API
 * (portal-autofill-api DEC-001 / DEC-003). CLI / map-check removed.
 * Evidence capture + persist for HTTP path (portal-autofill-screenshot-evidence).
 * Staff list-by-application (portal-autofill-evidence-ui DEC-001 / DEC-004).
 */
@Injectable()
export class PortalAutofillService implements IPortalAutofillService {
  constructor(
    private readonly configService: PortalConfigService,
    private readonly dataService: PortalDataService,
    private readonly mapper: PortalFieldMapperService,
    private readonly fillService: PortalFillService,
    @InjectRepository(PortalAutofillRun)
    private readonly runRepo: Repository<PortalAutofillRun>,
    @InjectRepository(Application)
    private readonly appsRepo: Repository<Application>,
  ) {}

  /**
   * Authenticated HTTP autofill (DEC-001–009): DB load → map → live URL fill → report.
   * Does not emit stdout; maps outcomes to HTTP statuses via controller.
   * Assigns managed screenshot path, persists run row, attaches `evidence` (DEC-004–008).
   */
  async runForHttp(
    input: PortalAutofillHttpInput,
  ): Promise<PortalAutofillHttpOutcome> {
    const config = this.configService.load();

    if (!config.portalBaseUrl) {
      throw new HttpException(
        'Не задан адрес портала (VISES_PORTAL_BASE_URL)',
        HttpStatus.BAD_REQUEST,
      );
    }

    const headed = this.configService.resolveHeaded(config);

    let targetUrl: string;
    try {
      targetUrl = this.configService.resolvePortalRegisterUrl(config);
    } catch (err) {
      throw new HttpException(
        err instanceof Error
          ? err.message
          : 'Некорректная конфигурация портала',
        HttpStatus.BAD_REQUEST,
      );
    }

    const loaded = await this.dataService.load({
      applicationId: input.applicationId,
      applicantId: input.applicantId,
    });

    const mapping = this.mapper.mapFields(
      loaded.application,
      loaded.applicant,
      config.overrides,
    );

    if (!mapping.ok) {
      const report = buildReport(mapping);
      return mapAutofillReportToHttpOutcome({
        report,
        mappingAborted: true,
        browserHardFailure: false,
      });
    }

    const runId = uid('paf');
    const { relativePath, absolutePath } = buildEvidenceAbsolutePath(
      input.applicationId,
      runId,
    );
    ensureEvidenceDir(absolutePath);

    const fill = await this.fillService.fillRegisterForm({
      targetUrl,
      mapping,
      navTimeoutMs: config.navTimeoutMs,
      headed,
      browserChannel: config.browserChannel,
      skipCaptchaGuard: config.skipCaptchaGuard,
      clickVerify: config.clickVerify,
      keepOpenMs: config.keepOpenMs,
      screenshotPath: absolutePath,
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
            config.skipCaptchaGuard
              ? 'CAPTCHA guard skipped (VISES_PORTAL_SKIP_CAPTCHA_GUARD)'
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
            ? '#btnVerify clicked after fill'
            : 'fill-only: #btnVerify not clicked; EmailOtp not filled (DEC-007)',
          config.skipCaptchaGuard
            ? 'CAPTCHA guard skipped (operator-owned CAPTCHA)'
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
      throw new HttpException('Нет такой заявки', HttpStatus.NOT_FOUND);
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
      throw new HttpException('Скриншот не найден', HttpStatus.NOT_FOUND);
    }

    let absolutePath: string;
    try {
      absolutePath = resolveEvidenceAbsolutePath(run.screenshotRelativePath);
    } catch {
      throw new HttpException('Скриншот не найден', HttpStatus.NOT_FOUND);
    }

    if (!evidenceFileExists(absolutePath)) {
      throw new HttpException('Скриншот не найден', HttpStatus.NOT_FOUND);
    }

    return {
      stream: openEvidenceStream(absolutePath),
      filename: `${runId}.png`,
    };
  }
}
