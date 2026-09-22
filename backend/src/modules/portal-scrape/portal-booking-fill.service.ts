/**
 * Patchright navigation + login + booking safe-stop façade
 * (REQ-020 / CON-006 / TASK-012).
 * Lazy-loads patchright only when invoked — never at API boot.
 */
import { Injectable, Logger } from '@nestjs/common';
import { CapMonsterService } from '../capmonster';
import { PORTAL_KEEP_OPEN_MS, PORTAL_NAV_TIMEOUT_MS } from './constants';
import type {
  FillPortalBookingSafeStopOptions,
  FillPortalBookingSafeStopResult,
  PortalBrowser,
  PortalPatchrightModule,
} from './types';
import {
  formatPortalLogContext,
  normalizeTargetUrl,
  runPortalBookingSafeStopPipeline,
} from './utils';

@Injectable()
export class PortalBookingFillService {
  private readonly logger = new Logger(PortalBookingFillService.name);

  constructor(private readonly capMonster: CapMonsterService) {}

  /**
   * Navigate to login, authenticate, open Book New Appointment, optional
   * unambiguous prefill, then stop before VisaType submit / payment / Premium
   * Lounge Accept (CON-006). Never logs password values.
   */
  async fillBookingSafeStop(
    options: FillPortalBookingSafeStopOptions,
  ): Promise<FillPortalBookingSafeStopResult> {
    const loginUrl = normalizeTargetUrl(options.loginUrl);
    const manageApplicantsUrl = normalizeTargetUrl(options.manageApplicantsUrl);
    let browser: PortalBrowser | undefined;
    const logPrefix = formatPortalLogContext({
      applicationId: options.applicationId ?? 'unknown',
      applicantId: 'booking',
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

      this.logger.log(`${logPrefix} phase=booking_safe_stop_pipeline start`);
      const pipeline = await runPortalBookingSafeStopPipeline({
        page,
        portalFormEmail: options.portalFormEmail,
        portalPassword: options.portalPassword,
        manageApplicantsUrl,
        prefill: options.prefill,
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
          `${logPrefix} phase=booking_safe_stop_pipeline hard_failure ${pipeline.error ?? 'unknown'}`,
        );
        return {
          navigationOk: false,
          bookingSelectionUiOpen: pipeline.bookingSelectionUiOpen,
          prefill: pipeline.prefill,
          notSafeToRepeat: pipeline.notSafeToRepeat,
          error: pipeline.error,
          notes: pipeline.notes,
        };
      }

      this.logger.log(
        `${logPrefix} phase=booking_safe_stop_pipeline success bookingUiOpen=${pipeline.bookingSelectionUiOpen === true}`,
      );
      return {
        navigationOk: true,
        bookingSelectionUiOpen: pipeline.bookingSelectionUiOpen === true,
        prefill: pipeline.prefill,
        notSafeToRepeat: pipeline.notSafeToRepeat,
        notes: pipeline.notes,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `${logPrefix} phase=booking_safe_stop_pipeline unexpected ${error}`,
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
