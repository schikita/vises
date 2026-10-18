import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import type { AppEnv } from '../config';
import { resolveUploadDir } from '../apps/utils';
import { Application } from '../database/entities/application.entity';
import { PortalAutofillRun } from '../database/entities/portal-autofill-run.entity';
import {
  PortalConfigService,
  PortalSiteAdapterRegistry,
  listApplicationApplicantIds,
  mapPortalClientPortalProgress,
  resolvePortalSiteOutcomeForAdapter,
} from '../portal-core';
import {
  PORTAL_AUTOFILL_CAPTURE_STATUS,
  PORTAL_AUTOFILL_RUN_LIST_DEFAULT_LIMIT,
  PORTAL_AUTOFILL_RUN_STATUS,
} from './constants';
import type {
  PortalAutofillRunListResponse,
  PortalClientPortalProgress,
} from './types';
import {
  buildPortalAutofillEmptyRetryEligibility,
  computePortalAutofillRetryEligibility,
  mapPortalAutofillRunListItem,
  openEvidenceStream,
  resolveEvidenceAbsolutePath,
  resolvePortalAutofillEligibilityApplicantId,
} from './utils';

/**
 * API read façade for portal autofill evidence / progress (DEC-019).
 * No Patchright / fill / proxy lease — execute paths live on workflow-worker.
 * Staff POST portal-autofill remains 410 on the controller.
 */
@Injectable()
export class PortalAutofillService {
  private readonly logger = new Logger(PortalAutofillService.name);
  private readonly uploadDir: string;

  constructor(
    private readonly configService: PortalConfigService,
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
   * List portal autofill runs for an application (DEC-007 / REQ-006 / REQ-007).
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
    const captchaServiceKeyConfigured = Boolean(
      config.captchaServiceApiKey?.trim().length,
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
      captchaServiceKeyConfigured,
      nowMs,
    });

    return {
      runs: rows.map((r) => mapPortalAutofillRunListItem(r, nowMs)),
      retryEligibility,
      eligibilityApplicantId,
    };
  }

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

    try {
      return {
        stream: openEvidenceStream(absolutePath),
        filename: `${runId}.png`,
      };
    } catch (err) {
      this.logger.warn(
        `portal_autofill_screenshot_open_failed runId=${runId} detail=${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      throw new HttpException('Screenshot not found', HttpStatus.NOT_FOUND);
    }
  }
}
