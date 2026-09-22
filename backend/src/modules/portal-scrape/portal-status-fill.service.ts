/**
 * Patchright navigation + login + status-validate façade (REQ-018 / REQ-019).
 * Lazy-loads patchright only when invoked — never at API boot.
 */
import { Injectable, Logger } from '@nestjs/common';
import { CapMonsterService } from '../capmonster';
import { PORTAL_KEEP_OPEN_MS, PORTAL_NAV_TIMEOUT_MS } from './constants';
import type {
  FillPortalStatusValidateOptions,
  FillPortalStatusValidateResult,
  PortalBrowser,
  PortalPatchrightModule,
} from './types';
import {
  formatPortalLogContext,
  normalizeTargetUrl,
  runPortalStatusValidatePipeline,
} from './utils';

@Injectable()
export class PortalStatusFillService {
  private readonly logger = new Logger(PortalStatusFillService.name);

  constructor(private readonly capMonster: CapMonsterService) {}

  /**
   * Navigate to login, authenticate, open Manage Applicants, scrape/normalize
   * status, and attempt edit+attention when Form Filling In-Progress.
   * Never logs password values.
   */
  async fillStatusValidate(
    options: FillPortalStatusValidateOptions,
  ): Promise<FillPortalStatusValidateResult> {
    const loginUrl = normalizeTargetUrl(options.loginUrl);
    const manageApplicantsUrl = normalizeTargetUrl(options.manageApplicantsUrl);
    let browser: PortalBrowser | undefined;
    const logPrefix = formatPortalLogContext({
      applicationId: options.applicationId ?? 'unknown',
      applicantId: options.applicant.applicantId,
    });
    const emptyNotes: string[] = [];

    try {
      const patchright = (await import(
        'patchright'
      )) as unknown as PortalPatchrightModule;
      const chromium = patchright.chromium;

      this.logger.log(`${logPrefix} phase=browser_launch start`);
      try {
        browser = await chromium.launch({
          headless: !options.headed,
          channel: 'chrome',
        });
        this.logger.log(`${logPrefix} phase=browser_launch success`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const error = `Browser launch failed (install Chrome via \`npx patchright install chrome\`): ${msg}`;
        this.logger.error(
          `${logPrefix} phase=browser_launch failure ${error}`,
        );
        return { navigationOk: false, error, notes: emptyNotes };
      }

      const context = await browser.newContext(
        options.browserProxy
          ? {
              proxy: {
                server: options.browserProxy.server,
                ...(options.browserProxy.username !== undefined
                  ? { username: options.browserProxy.username }
                  : {}),
                ...(options.browserProxy.password !== undefined
                  ? { password: options.browserProxy.password }
                  : {}),
                ...(options.browserProxy.bypass !== undefined
                  ? { bypass: options.browserProxy.bypass }
                  : {}),
              },
            }
          : undefined,
      );
      const page = await context.newPage();
      page.setDefaultTimeout(PORTAL_NAV_TIMEOUT_MS);
      page.setDefaultNavigationTimeout(PORTAL_NAV_TIMEOUT_MS);

      this.logger.log(`${logPrefix} phase=navigation start`);
      try {
        await page.goto(loginUrl, {
          waitUntil: 'domcontentloaded',
          timeout: PORTAL_NAV_TIMEOUT_MS,
        });
        this.logger.log(`${logPrefix} phase=navigation success`);
      } catch (err) {
        const error = `navigation failed: ${
          err instanceof Error ? err.message : String(err)
        }`;
        this.logger.error(`${logPrefix} phase=navigation failure ${error}`);
        return { navigationOk: false, error, notes: emptyNotes };
      }

      this.logger.log(`${logPrefix} phase=status_validate_pipeline start`);
      const pipeline = await runPortalStatusValidatePipeline({
        page,
        portalFormEmail: options.portalFormEmail,
        portalPassword: options.portalPassword,
        manageApplicantsUrl,
        applicant: options.applicant,
        editFill: options.editFill,
        capMonsterApiKey: options.capMonsterApiKey,
        capMonster: this.capMonster,
        logPrefix,
      });

      if (PORTAL_KEEP_OPEN_MS > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, PORTAL_KEEP_OPEN_MS),
        );
      }

      await context.close().catch(() => undefined);

      if (!pipeline.ok) {
        this.logger.error(
          `${logPrefix} phase=status_validate_pipeline hard_failure ${pipeline.error ?? 'unknown'}`,
        );
        return {
          navigationOk: false,
          status: pipeline.status,
          statusRaw: pipeline.statusRaw,
          editAttempted: pipeline.editAttempted,
          attentionAccepted: pipeline.attentionAccepted,
          submitAmbiguous: pipeline.submitAmbiguous,
          error: pipeline.error,
          notes: pipeline.notes,
        };
      }

      this.logger.log(
        `${logPrefix} phase=status_validate_pipeline success readyToBook=${pipeline.readyToBook === true}`,
      );
      return {
        navigationOk: true,
        readyToBook: pipeline.readyToBook === true,
        status: pipeline.status,
        statusRaw: pipeline.statusRaw,
        editAttempted: pipeline.editAttempted,
        attentionAccepted: pipeline.attentionAccepted,
        notes: pipeline.notes,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `${logPrefix} phase=status_validate_pipeline unexpected ${error}`,
      );
      return { navigationOk: false, error, notes: emptyNotes };
    } finally {
      if (browser) {
        await browser.close().catch((closeErr) => {
          this.logger.error(
            `${logPrefix} browser close failed: ${
              closeErr instanceof Error ? closeErr.message : String(closeErr)
            }`,
          );
        });
      }
    }
  }
}
