import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AppEnv } from '../config';
import { uid } from '../../shared/utils';
import {
  isProxy6ApiError,
  PortalProxyLeaseService,
  type PortalProxyLease,
  PROXY6_MSG_MISCONFIGURED,
} from '../proxy6';
import { Application } from '../database/entities/application.entity';
import { resolveUploadDir } from '../apps/utils';
import {
  PORTAL_LOGIN_PREP_MSG_APP_NOT_FOUND,
  PORTAL_LOGIN_PREP_MSG_BASE_URL,
  PORTAL_LOGIN_PREP_MSG_INVALID_CONFIG,
  PORTAL_LOGIN_PREP_MSG_LOGIN_PATH,
  PORTAL_LOGIN_PREP_MSG_MISSING_PORTAL_EMAIL,
} from './constants';
import { PortalConfigService } from './portal-config.service';
import { PortalLoginPrepFillService } from './portal-login-prep-fill.service';
import type { PortalLoginPrepHttpOutcome, PortalLoginPrepReport } from './types';
import {
  buildLoginPrepEvidenceAbsolutePath,
  ensureEvidenceDir,
  evidenceFileExists,
  formatPortalLogContext,
  unlinkEvidenceBestEffort,
} from './utils';

/**
 * Staff HTTP portal login preparation (DEC-002 / DEC-006–008 / DEC-012).
 * Navigates login URL, fills portalFormEmail among decoys, optional CapMonster
 * Verify. Browser egress via Proxy6 lease when PROXY6_API_KEY set (DEC-003/005).
 * Stops before password / OTP-after-verify / status scrape (workflow LOGIN
 * opts in via submitPassword on the shared pipeline — TASK-009).
 */
@Injectable()
export class PortalLoginPrepService {
  private readonly logger = new Logger(PortalLoginPrepService.name);
  private readonly uploadDir: string;

  constructor(
    private readonly configService: PortalConfigService,
    private readonly fillService: PortalLoginPrepFillService,
    private readonly proxyLeaseService: PortalProxyLeaseService,
    @InjectRepository(Application)
    private readonly appsRepo: Repository<Application>,
    config: ConfigService<AppEnv, true>,
  ) {
    this.uploadDir = resolveUploadDir(
      config.get('UPLOAD_DIR', { infer: true }),
    );
  }

  /**
   * POST /api/apps/:applicationId/portal-login-prep (admin|manager).
   * Sync long HTTP. Acquire proxy before browser; release in finally (SUB-002).
   */
  async runForHttp(applicationId: string): Promise<PortalLoginPrepHttpOutcome> {
    const logPrefix = formatPortalLogContext({
      applicationId,
      applicantId: 'login-prep',
    });
    let lease: PortalProxyLease | undefined;
    let absolutePath: string | undefined;
    let relativePath: string | undefined;

    this.logger.log(`${logPrefix} workflow.start`);

    try {
      const app = await this.appsRepo.findOne({ where: { id: applicationId } });
      if (!app) {
        throw new HttpException(
          PORTAL_LOGIN_PREP_MSG_APP_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const portalFormEmail = app.portalFormEmail?.trim() ?? '';
      if (!portalFormEmail) {
        throw new HttpException(
          PORTAL_LOGIN_PREP_MSG_MISSING_PORTAL_EMAIL,
          HttpStatus.BAD_REQUEST,
        );
      }

      const config = await this.configService.load();
      if (!config.portalBaseUrl?.trim()) {
        throw new HttpException(
          PORTAL_LOGIN_PREP_MSG_BASE_URL,
          HttpStatus.BAD_REQUEST,
        );
      }

      let loginUrl: string;
      try {
        loginUrl = this.configService.resolvePortalLoginUrl(config);
      } catch (err) {
        const raw = err instanceof Error ? err.message : '';
        const message = raw.includes('LOGIN_PATH')
          ? PORTAL_LOGIN_PREP_MSG_LOGIN_PATH
          : raw.includes('BASE_URL')
            ? PORTAL_LOGIN_PREP_MSG_BASE_URL
            : PORTAL_LOGIN_PREP_MSG_INVALID_CONFIG;
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }

      if (config.proxy6Misconfigured) {
        throw new HttpException(
          PROXY6_MSG_MISCONFIGURED,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (config.proxy6Enabled) {
        try {
          lease = await this.proxyLeaseService.acquire(config);
          this.logger.log(`${logPrefix} decision proxy=leased`);
        } catch (err) {
          throw this.mapProxyAcquireFailure(err);
        }
      } else {
        this.logger.log(`${logPrefix} decision proxy=direct_egress`);
      }

      const prepId = uid('loginprep');
      const evidence = buildLoginPrepEvidenceAbsolutePath(
        applicationId,
        prepId,
        this.uploadDir,
      );
      relativePath = evidence.relativePath;
      absolutePath = evidence.absolutePath;
      ensureEvidenceDir(absolutePath);

      const headed = this.configService.resolveHeaded();
      const capMonsterKey = config.capMonsterApiKey?.trim() ?? '';

      this.logger.log(`${logPrefix} stage=fill start url=${loginUrl}`);
      const fill = await this.fillService.fillLoginPrep({
        targetUrl: loginUrl,
        portalFormEmail,
        headed,
        screenshotPath: absolutePath,
        capMonsterApiKey: config.capMonsterApiKey,
        browserProxy: lease?.browserProxy,
        applicationId,
      });

      const pngPresent =
        absolutePath !== undefined && evidenceFileExists(absolutePath);
      if (!pngPresent && absolutePath) {
        unlinkEvidenceBestEffort(absolutePath);
      }

      const notes = [
        ...fill.notes,
        headed ? 'browser headed=true' : 'browser headed=false',
        lease ? 'proxy lease used (Proxy6; DEC-003/005)' : 'direct egress',
        capMonsterKey
          ? 'CapMonster key present'
          : 'CapMonster key empty (fill-only)',
      ];

      if (!fill.navigationOk) {
        const report: PortalLoginPrepReport = {
          ok: false,
          applicationId,
          loginUrl,
          emailFilled: fill.emailFilled,
          verifyClicked: fill.verifyClicked,
          capMonsterAttempted: fill.capMonsterAttempted,
          capMonsterOk: fill.capMonsterOk,
          screenshotRelativePath: pngPresent ? relativePath : null,
          notes,
          error: fill.error ?? 'login prep failed',
        };
        this.logger.error(
          `${logPrefix} workflow.end outcome=hard_failure detail=${report.error}`,
        );
        return { httpStatus: 502, report };
      }

      const report: PortalLoginPrepReport = {
        ok: fill.emailFilled,
        applicationId,
        loginUrl,
        emailFilled: fill.emailFilled,
        verifyClicked: fill.verifyClicked,
        capMonsterAttempted: fill.capMonsterAttempted,
        capMonsterOk: fill.capMonsterOk,
        screenshotRelativePath: pngPresent ? relativePath : null,
        notes,
      };

      if (!report.ok) {
        this.logger.log(
          `${logPrefix} workflow.end outcome=completed_with_errors`,
        );
        return { httpStatus: 422, report };
      }

      this.logger.log(`${logPrefix} workflow.end outcome=success`);
      return { httpStatus: 200, report };
    } catch (err) {
      if (absolutePath) {
        unlinkEvidenceBestEffort(absolutePath);
      }
      if (err instanceof HttpException) {
        this.logger.error(
          `${logPrefix} workflow.end outcome=failure detail=${err.message}`,
        );
        throw err;
      }
      const detail = err instanceof Error ? err.message : 'unexpected_failure';
      this.logger.error(
        `${logPrefix} workflow.end outcome=failure detail=${detail}`,
      );
      throw err;
    } finally {
      if (lease) {
        await lease.release().catch(() => undefined);
      }
    }
  }

  /** Map lease/list failures to HTTP (fail closed — never host IP / secrets). */
  private mapProxyAcquireFailure(err: unknown): HttpException {
    if (isProxy6ApiError(err)) {
      if (err.code === 'misconfigured') {
        return new HttpException(err.message, HttpStatus.BAD_REQUEST);
      }
      return new HttpException(err.message, HttpStatus.SERVICE_UNAVAILABLE);
    }
    const message =
      err instanceof Error ? err.message : PROXY6_MSG_MISCONFIGURED;
    return new HttpException(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
