/**
 * Patchright navigation + login + booking continue facade
 * (REQ-002…012 / CON-004 / CON-005 / DEC-001 / VT-TASK-007).
 * Lazy-loads patchright only when invoked — never at API boot.
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { BrowserSessionBudgetService } from '../portal-core/browser-session-budget.service';
import { PORTAL_CONCURRENCY_CAP_HIT } from '../portal-core/constants/browser-session-budget.constants';
import {
  PORTAL_BROWSER_LAUNCH_TIMEOUT_MS,
  PORTAL_KEEP_OPEN_MS,
  PORTAL_NAV_TIMEOUT_MS,
} from '../portal-core/constants/portal-config.defaults.constants';
import { formatPortalLogContext } from '../portal-core/utils/format-portal-log-context.util';
import { normalizeTargetUrl } from '../portal-core/utils/normalize-target-url.util';
import {
  TEMPORARY_EMAIL_PROVIDER,
  type TemporaryEmailProvider,
} from '../temporary-email';
import { PORTAL_FILL_ABORTED_ERROR } from './constants/portal-fill-abort.constants';
import { CAPTCHA_PROVIDER } from './constants/portal-fill-di.tokens';
import type { CaptchaProvider } from './interfaces/captcha-provider.interface';
import type {
  FillPortalBookingContinueOptions,
  FillPortalBookingContinueResult,
} from './types/portal-booking.types';
import type {
  PortalBrowser,
  PortalPatchrightModule,
} from './types/patchright-surface.types';
import { invokePortalFillBrowserLaunched } from './utils/invoke-portal-fill-browser-launched.util';
import { isPortalFillAbortRequested } from './utils/is-portal-fill-abort-requested.util';
import { runPortalBookingContinuePipeline } from './utils/run-portal-booking-continue-pipeline.util';

@Injectable()
export class PortalBookingFillService {
  private readonly logger = new Logger(PortalBookingFillService.name);

  constructor(
    @Inject(CAPTCHA_PROVIDER)
    private readonly captchaProvider: CaptchaProvider,
    @Inject(TEMPORARY_EMAIL_PROVIDER)
    private readonly mailProvider: TemporaryEmailProvider,
    private readonly sessionBudget: BrowserSessionBudgetService,
  ) {}

  /**
   * Navigate to login, authenticate, complete email DP consent, open Book New
   * Appointment, optional unambiguous prefill, VisaType Submit, captcha probe,
   * then slots SAFE_TO_REPEAT or UNKNOWN_NEXT staff terminal (DEC-001 /
   * DEC-004 / DEC-008 / CON-005 / OQ-007 / REQ-013…017 / VT-TASK-007…010).
   * Never Premium Accept / payment. Never logs password / mail secrets /
   * captcha answers.
   */
  async fillBookingContinue(
    options: FillPortalBookingContinueOptions,
  ): Promise<FillPortalBookingContinueResult> {
    const loginUrl = normalizeTargetUrl(options.loginUrl);
    const homeUrl = normalizeTargetUrl(options.homeUrl);
    const manageApplicantsUrl = normalizeTargetUrl(options.manageApplicantsUrl);
    let browser: PortalBrowser | undefined;
    let sessionSlotHeld = false;
    const logPrefix = formatPortalLogContext({
      applicationId: options.applicationId ?? 'unknown',
      applicantId: 'booking',
    });
    const emptyNotes: string[] = [];

    const abortedResult = (): FillPortalBookingContinueResult => ({
      navigationOk: false,
      aborted: true,
      error: PORTAL_FILL_ABORTED_ERROR,
      notes: emptyNotes,
    });

    try {
      if (isPortalFillAbortRequested(options.abortSignal)) {
        this.logger.log(`${logPrefix} phase=abort pre_launch`);
        return abortedResult();
      }

      if (!this.sessionBudget.tryAcquireSession('portal')) {
        return {
          navigationOk: false,
          error: PORTAL_CONCURRENCY_CAP_HIT,
          errorCode: PORTAL_CONCURRENCY_CAP_HIT,
          notes: emptyNotes,
        };
      }
      sessionSlotHeld = true;

      const patchright = (await import(
        'patchright'
      )) as unknown as PortalPatchrightModule;
      const chromium = patchright.chromium;

      this.logger.log(`${logPrefix} phase=browser_launch start`);
      try {
        browser = await chromium.launch({
          headless: !options.headed,
          channel: 'chrome',
          timeout: PORTAL_BROWSER_LAUNCH_TIMEOUT_MS,
        });
        this.logger.log(`${logPrefix} phase=browser_launch success`);
      } catch (err) {
        if (isPortalFillAbortRequested(options.abortSignal)) {
          return abortedResult();
        }
        const msg = err instanceof Error ? err.message : String(err);
        const error = `Browser launch failed (install Chrome via \`npx patchright install chrome\`): ${msg}`;
        this.logger.error(
          `${logPrefix} phase=browser_launch failure ${error}`,
        );
        return { navigationOk: false, error, notes: emptyNotes };
      }

      const launched = browser;
      invokePortalFillBrowserLaunched({
        onBrowserLaunched: options.onBrowserLaunched,
        close: async () => {
          await launched.close().catch(() => undefined);
        },
      });

      if (isPortalFillAbortRequested(options.abortSignal)) {
        this.logger.log(`${logPrefix} phase=abort post_launch`);
        return abortedResult();
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
        if (isPortalFillAbortRequested(options.abortSignal)) {
          return abortedResult();
        }
        const error = `navigation failed: ${
          err instanceof Error ? err.message : String(err)
        }`;
        this.logger.error(`${logPrefix} phase=navigation failure ${error}`);
        return { navigationOk: false, error, notes: emptyNotes };
      }

      if (isPortalFillAbortRequested(options.abortSignal)) {
        return abortedResult();
      }

      this.logger.log(`${logPrefix} phase=booking_continue_pipeline start`);
      const pipeline = await runPortalBookingContinuePipeline({
        page,
        portalFormEmail: options.portalFormEmail,
        portalPassword: options.portalPassword,
        homeUrl,
        manageApplicantsUrl,
        prefill: options.prefill,
        captchaServiceApiKey: options.captchaServiceApiKey,
        captchaProvider: this.captchaProvider,
        mailProvider: this.mailProvider,
        mailbox: options.mailbox,
        priorCheckpoint: options.priorCheckpoint,
        onCheckpoint: options.onCheckpoint,
        logPrefix,
        abortSignal: options.abortSignal,
      });

      if (isPortalFillAbortRequested(options.abortSignal)) {
        return abortedResult();
      }

      if (PORTAL_KEEP_OPEN_MS > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, PORTAL_KEEP_OPEN_MS),
        );
      }

      await context.close().catch(() => undefined);

      if (!pipeline.ok) {
        this.logger.error(
          `${logPrefix} phase=booking_continue_pipeline hard_failure ${pipeline.error ?? 'unknown'}`,
        );
        return {
          navigationOk: false,
          bookingSelectionUiOpen: pipeline.bookingSelectionUiOpen,
          visaTypeSubmitted: pipeline.visaTypeSubmitted,
          captchaPresent: pipeline.captchaPresent,
          captchaOk: pipeline.captchaOk,
          slotsUnavailable: pipeline.slotsUnavailable,
          unknownNext: pipeline.unknownNext,
          prefill: pipeline.prefill,
          notSafeToRepeat: pipeline.notSafeToRepeat,
          error: pipeline.error,
          ...(pipeline.errorCode
            ? { errorCode: pipeline.errorCode }
            : {}),
          notes: pipeline.notes,
        };
      }

      this.logger.log(
        `${logPrefix} phase=booking_continue_pipeline success bookingUiOpen=${pipeline.bookingSelectionUiOpen === true} submitted=${pipeline.visaTypeSubmitted === true} unknownNext=${pipeline.unknownNext === true} captchaPresent=${pipeline.captchaPresent === true} captchaOk=${pipeline.captchaOk === true}`,
      );
      return {
        navigationOk: true,
        bookingSelectionUiOpen: pipeline.bookingSelectionUiOpen === true,
        visaTypeSubmitted: pipeline.visaTypeSubmitted === true,
        captchaPresent: pipeline.captchaPresent,
        captchaOk: pipeline.captchaOk,
        slotsUnavailable: pipeline.slotsUnavailable,
        unknownNext: pipeline.unknownNext === true,
        prefill: pipeline.prefill,
        notSafeToRepeat: pipeline.notSafeToRepeat,
        notes: pipeline.notes,
      };
    } catch (err) {
      if (isPortalFillAbortRequested(options.abortSignal)) {
        return abortedResult();
      }
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `${logPrefix} phase=booking_continue_pipeline unexpected ${error}`,
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
      if (sessionSlotHeld) {
        this.sessionBudget.releaseSession('portal');
      }
    }
  }
}
