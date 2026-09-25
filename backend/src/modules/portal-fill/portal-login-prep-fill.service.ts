/**
 * Patchright navigation + login Email-verify prep facade (DEC-002 / DEC-010 / DEC-012).
 * Lazy-loads patchright only when invoked — never at API boot.
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  PORTAL_KEEP_OPEN_MS,
  PORTAL_NAV_TIMEOUT_MS,
} from '../portal-core/constants/portal-config.defaults.constants';
import { formatPortalLogContext } from '../portal-core/utils/format-portal-log-context.util';
import { normalizeTargetUrl } from '../portal-core/utils/normalize-target-url.util';
import { PORTAL_FILL_ABORTED_ERROR } from './constants/portal-fill-abort.constants';
import { CAPTCHA_PROVIDER } from './constants/portal-fill-di.tokens';
import type { CaptchaProvider } from './interfaces/captcha-provider.interface';
import type {
  FillPortalLoginPrepOptions,
  FillPortalLoginPrepResult,
} from './types/portal-login-prep-fill.types';
import type {
  PortalBrowser,
  PortalPatchrightModule,
} from './types/patchright-surface.types';
import { invokePortalFillBrowserLaunched } from './utils/invoke-portal-fill-browser-launched.util';
import { isPortalFillAbortRequested } from './utils/is-portal-fill-abort-requested.util';
import { runPortalLoginPrepPipeline } from './utils/run-portal-login-prep-pipeline.util';

@Injectable()
export class PortalLoginPrepFillService {
  private readonly logger = new Logger(PortalLoginPrepFillService.name);

  constructor(
    @Inject(CAPTCHA_PROVIDER)
    private readonly captchaProvider: CaptchaProvider,
  ) {}

  /**
   * Navigate to login URL, fill portal-form email among decoys, optional Verify.
   * Staff path: stop before password. Workflow path: `submitPassword: true`.
   */
  async fillLoginPrep(
    options: FillPortalLoginPrepOptions,
  ): Promise<FillPortalLoginPrepResult> {
    const targetUrl = normalizeTargetUrl(options.targetUrl);
    let browser: PortalBrowser | undefined;
    const logPrefix = formatPortalLogContext({
      applicationId: options.applicationId ?? 'unknown',
      applicantId: 'login-prep',
    });
    const emptyNotes: string[] = [];

    const abortedResult = (): FillPortalLoginPrepResult => ({
      navigationOk: false,
      aborted: true,
      error: PORTAL_FILL_ABORTED_ERROR,
      emailFilled: false,
      verifyClicked: false,
      captchaAttempted: false,
      captchaOk: false,
      notes: emptyNotes,
    });

    try {
      if (isPortalFillAbortRequested(options.abortSignal)) {
        this.logger.log(`${logPrefix} phase=abort pre_launch`);
        return abortedResult();
      }

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
          emailFilled: false,
          verifyClicked: false,
          captchaAttempted: false,
          captchaOk: false,
          notes: emptyNotes,
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
        const error = `navigation failed: ${
          err instanceof Error ? err.message : String(err)
        }`;
        this.logger.error(`${logPrefix} phase=navigation failure ${error}`);
        return {
          navigationOk: false,
          error,
          emailFilled: false,
          verifyClicked: false,
          captchaAttempted: false,
          captchaOk: false,
          notes: emptyNotes,
        };
      }

      if (isPortalFillAbortRequested(options.abortSignal)) {
        return abortedResult();
      }

      this.logger.log(`${logPrefix} phase=login_prep_pipeline start`);
      const pipeline = await runPortalLoginPrepPipeline({
        page,
        portalFormEmail: options.portalFormEmail,
        screenshotPath: options.screenshotPath,
        captchaServiceApiKey: options.captchaServiceApiKey,
        captchaProvider: this.captchaProvider,
        logPrefix,
        submitPassword: options.submitPassword === true,
        portalPassword: options.portalPassword,
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
          `${logPrefix} phase=login_prep_pipeline hard_failure ${pipeline.error ?? 'unknown'}`,
        );
        return {
          navigationOk: false,
          error: pipeline.error,
          ...(pipeline.errorCode
            ? { errorCode: pipeline.errorCode }
            : {}),
          emailFilled: pipeline.emailFilled,
          verifyClicked: pipeline.verifyClicked,
          captchaAttempted: pipeline.captchaAttempted,
          captchaOk: pipeline.captchaOk,
          passwordFilled: pipeline.passwordFilled,
          passwordSubmitted: pipeline.passwordSubmitted,
          passwordSubmitAmbiguous: pipeline.passwordSubmitAmbiguous,
          loginAuthenticatedVerified: pipeline.loginAuthenticatedVerified,
          screenshotPath: pipeline.screenshotPath,
          notes: pipeline.notes,
        };
      }

      this.logger.log(`${logPrefix} phase=login_prep_pipeline success`);
      return {
        navigationOk: true,
        emailFilled: pipeline.emailFilled,
        verifyClicked: pipeline.verifyClicked,
        captchaAttempted: pipeline.captchaAttempted,
        captchaOk: pipeline.captchaOk,
        passwordFilled: pipeline.passwordFilled,
        passwordSubmitted: pipeline.passwordSubmitted,
        passwordSubmitAmbiguous: pipeline.passwordSubmitAmbiguous,
        loginAuthenticatedVerified: pipeline.loginAuthenticatedVerified,
        screenshotPath: pipeline.screenshotPath,
        notes: pipeline.notes,
      };
    } catch (err) {
      if (isPortalFillAbortRequested(options.abortSignal)) {
        return abortedResult();
      }
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `${logPrefix} phase=login_prep_pipeline unexpected ${error}`,
      );
      return {
        navigationOk: false,
        error,
        emailFilled: false,
        verifyClicked: false,
        captchaAttempted: false,
        captchaOk: false,
        notes: emptyNotes,
      };
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
