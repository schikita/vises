/**
 * Patchright navigation + fill facade for RegisterUser (DEC-006/007/010).
 * Lazy-loads patchright inside fillRegisterForm only (CON-006 / DEC-010).
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { TEMPORARY_EMAIL_PROVIDER } from '../temporary-email';
import type { TemporaryEmailProvider } from '../temporary-email';
import { BrowserSessionBudgetService } from '../portal-core/browser-session-budget.service';
import { PORTAL_CONCURRENCY_CAP_HIT } from '../portal-core/constants/browser-session-budget.constants';
import {
  PORTAL_BROWSER_LAUNCH_TIMEOUT_MS,
  PORTAL_KEEP_OPEN_MS,
  PORTAL_NAV_TIMEOUT_MS,
} from '../portal-core/constants/portal-config.defaults.constants';
import { formatPortalLogContext } from '../portal-core/utils/format-portal-log-context.util';
import { normalizeTargetUrl } from '../portal-core/utils/normalize-target-url.util';
import { PORTAL_FILL_ABORTED_ERROR } from './constants/portal-fill-abort.constants';
import { CAPTCHA_PROVIDER } from './constants/portal-fill-di.tokens';
import type { CaptchaProvider } from './interfaces/captcha-provider.interface';
import type { IPortalFormFiller } from './interfaces/portal-form-filler.interface';
import type {
  FillRegisterFormOptions,
  FillRegisterFormResult,
} from './types/portal-fill.types';
import type {
  PortalBrowser,
  PortalPatchrightModule,
} from './types/patchright-surface.types';
import { invokePortalFillBrowserLaunched } from './utils/invoke-portal-fill-browser-launched.util';
import { isPortalFillAbortRequested } from './utils/is-portal-fill-abort-requested.util';
import { runPortalFillPipeline } from './utils/run-portal-fill-pipeline.util';

@Injectable()
export class PortalFillService implements IPortalFormFiller {
  private readonly logger = new Logger(PortalFillService.name);

  constructor(
    @Inject(TEMPORARY_EMAIL_PROVIDER)
    private readonly mailProvider: TemporaryEmailProvider,
    @Inject(CAPTCHA_PROVIDER)
    private readonly captchaProvider: CaptchaProvider,
    private readonly sessionBudget: BrowserSessionBudgetService,
  ) {}

  /**
   * Navigate and fill RegisterUser from a mapping result.
   * Skipped/failed mapping fields are not written; CountryCode never written.
   * EmailOtp written only when email OTP path is armed post-captcha.
   * Patchright is loaded only here (on-demand), never from API boot.
   */
  async fillRegisterForm(
    options: FillRegisterFormOptions,
  ): Promise<FillRegisterFormResult> {
    const targetUrl = normalizeTargetUrl(options.targetUrl);
    const fields = options.mapping.fields.map((f) => ({ ...f }));
    let browser: PortalBrowser | undefined;
    let sessionSlotHeld = false;
    const logPrefix = formatPortalLogContext({
      applicationId: options.mapping.applicationId,
      applicantId: options.mapping.applicantId,
      runId: options.runId,
    });

    const abortedResult = (): FillRegisterFormResult => ({
      navigationOk: false,
      aborted: true,
      error: PORTAL_FILL_ABORTED_ERROR,
      fields,
      verifyClicked: false,
      emailOtpTouched: false,
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
          fields,
          verifyClicked: false,
          emailOtpTouched: false,
        };
      }
      sessionSlotHeld = true;

      // Lazy/dynamic import — do not load browsers on Nest API boot (RISK-013).
      // Narrow to hand-written surface (DEC-006); do not eagerly import patchright types.
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
        return {
          navigationOk: false,
          error,
          fields,
          verifyClicked: false,
          emailOtpTouched: false,
        };
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
        await page.goto(targetUrl, {
          waitUntil: 'domcontentloaded',
          timeout: PORTAL_NAV_TIMEOUT_MS,
        });
        this.logger.log(`${logPrefix} phase=navigation success`);
      } catch (err) {
        if (isPortalFillAbortRequested(options.abortSignal)) {
          return abortedResult();
        }
        const error = `navigation failed: ${err instanceof Error ? err.message : String(err)}`;
        this.logger.error(`${logPrefix} phase=navigation failure ${error}`);
        return {
          navigationOk: false,
          error,
          fields,
          verifyClicked: false,
          emailOtpTouched: false,
        };
      }

      if (isPortalFillAbortRequested(options.abortSignal)) {
        return abortedResult();
      }

      this.logger.log(`${logPrefix} phase=pipeline start`);
      const pipeline = await runPortalFillPipeline({
        page,
        mapping: options.mapping,
        screenshotPath: options.screenshotPath,
        captchaServiceApiKey: options.captchaServiceApiKey,
        captchaProvider: this.captchaProvider,
        otpPathArmed: options.otpPathArmed === true,
        mailProvider: this.mailProvider,
        emailContextKey: options.emailContextKey,
        runId: options.runId,
        checkpoint: options.checkpoint,
        captchaRestore: options.captchaRestore,
        submitRegisterForm: options.submitRegisterForm === true,
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
          `${logPrefix} phase=pipeline overall hard_failure ${pipeline.error ?? 'unknown'}`,
        );
        return {
          navigationOk: false,
          error: pipeline.error,
          ...(pipeline.errorCode
            ? { errorCode: pipeline.errorCode }
            : {}),
          fields: pipeline.fields,
          verifyClicked: pipeline.verifyClicked,
          emailOtpTouched: pipeline.emailOtpTouched,
          usedStandIn: pipeline.usedStandIn,
          screenshotPath: pipeline.screenshotPath,
          captchaAttempted: pipeline.captchaAttempted,
          captchaOk: pipeline.captchaOk,
          emailOtpAttempted: pipeline.emailOtpAttempted,
          emailOtpOk: pipeline.emailOtpOk,
          emailOtpResendAttempts: pipeline.emailOtpResendAttempts,
          mailProviderCircuitOpen: pipeline.mailProviderCircuitOpen,
          temporaryMailboxCleanup: pipeline.temporaryMailboxCleanup,
          temporaryMailboxAddress: pipeline.temporaryMailboxAddress,
          temporaryMailboxPassword: pipeline.temporaryMailboxPassword,
          registerSubmitted: pipeline.registerSubmitted,
          registerSuccessVerified: pipeline.registerSuccessVerified,
          registerSubmitAmbiguous: pipeline.registerSubmitAmbiguous,
        };
      }

      this.logger.log(`${logPrefix} phase=pipeline overall success`);
      return {
        navigationOk: true,
        fields: pipeline.fields,
        countryCodeObserved: pipeline.countryCodeObserved,
        verifyClicked: pipeline.verifyClicked,
        emailOtpTouched: pipeline.emailOtpTouched,
        screenshotPath: pipeline.screenshotPath,
        usedStandIn: pipeline.usedStandIn,
        captchaAttempted: pipeline.captchaAttempted,
        captchaOk: pipeline.captchaOk,
        emailOtpAttempted: pipeline.emailOtpAttempted,
        emailOtpOk: pipeline.emailOtpOk,
        emailOtpResendAttempts: pipeline.emailOtpResendAttempts,
        mailProviderCircuitOpen: pipeline.mailProviderCircuitOpen,
        temporaryMailboxCleanup: pipeline.temporaryMailboxCleanup,
        temporaryMailboxAddress: pipeline.temporaryMailboxAddress,
        temporaryMailboxPassword: pipeline.temporaryMailboxPassword,
        registerSubmitted: pipeline.registerSubmitted,
        registerSuccessVerified: pipeline.registerSuccessVerified,
        registerSubmitAmbiguous: pipeline.registerSubmitAmbiguous,
      };
    } catch (err) {
      if (isPortalFillAbortRequested(options.abortSignal)) {
        return abortedResult();
      }
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `${logPrefix} phase=pipeline overall hard_failure unexpected ${error}`,
      );
      return {
        navigationOk: false,
        error,
        fields,
        verifyClicked: false,
        emailOtpTouched: false,
      };
    } finally {
      if (browser) {
        await browser.close().catch((closeErr) => {
          this.logger.error(
            `${logPrefix} browser close failed: ${closeErr instanceof Error ? closeErr.message : String(closeErr)}`,
          );
        });
      }
      if (sessionSlotHeld) {
        this.sessionBudget.releaseSession('portal');
      }
    }
  }
}
