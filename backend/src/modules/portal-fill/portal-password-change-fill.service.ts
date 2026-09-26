/**
 * Patchright navigation + login + conditional password-change facade (REQ-012).
 * Lazy-loads patchright only when invoked — never at API boot.
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
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
import type {
  FillPortalPasswordChangeOptions,
  FillPortalPasswordChangeResult,
} from './types/portal-password-change.types';
import type {
  PortalBrowser,
  PortalPatchrightModule,
} from './types/patchright-surface.types';
import { invokePortalFillBrowserLaunched } from './utils/invoke-portal-fill-browser-launched.util';
import { isPortalFillAbortRequested } from './utils/is-portal-fill-abort-requested.util';
import { runPortalPasswordChangePipeline } from './utils/run-portal-password-change-pipeline.util';

@Injectable()
export class PortalPasswordChangeFillService {
  private readonly logger = new Logger(PortalPasswordChangeFillService.name);

  constructor(
    @Inject(CAPTCHA_PROVIDER)
    private readonly captchaProvider: CaptchaProvider,
  ) {}

  /**
   * Navigate to login, authenticate with current vault password, then either
   * change password on forced UI or report not-presented (REQ-012).
   * Never logs password values.
   */
  async fillPasswordChange(
    options: FillPortalPasswordChangeOptions,
  ): Promise<FillPortalPasswordChangeResult> {
    const targetUrl = normalizeTargetUrl(options.targetUrl);
    let browser: PortalBrowser | undefined;
    const logPrefix = formatPortalLogContext({
      applicationId: options.applicationId ?? 'unknown',
      applicantId: 'password-change',
    });
    const emptyNotes: string[] = [];

    const abortedResult = (): FillPortalPasswordChangeResult => ({
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
        return { navigationOk: false, error, notes: emptyNotes };
      }

      if (isPortalFillAbortRequested(options.abortSignal)) {
        return abortedResult();
      }

      this.logger.log(`${logPrefix} phase=password_change_pipeline start`);
      const pipeline = await runPortalPasswordChangePipeline({
        page,
        portalFormEmail: options.portalFormEmail,
        currentPassword: options.currentPassword,
        newPassword: options.newPassword,
        captchaServiceApiKey: options.captchaServiceApiKey,
        captchaProvider: this.captchaProvider,
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
          `${logPrefix} phase=password_change_pipeline hard_failure ${pipeline.error ?? 'unknown'}`,
        );
        return {
          navigationOk: false,
          submitAmbiguous: pipeline.submitAmbiguous,
          error: pipeline.error,
          ...(pipeline.errorCode
            ? { errorCode: pipeline.errorCode }
            : {}),
          notes: pipeline.notes,
        };
      }

      if (pipeline.notPresented === true) {
        this.logger.log(
          `${logPrefix} phase=password_change_pipeline not_presented`,
        );
        return {
          navigationOk: true,
          notPresented: true,
          notes: pipeline.notes,
        };
      }

      this.logger.log(
        `${logPrefix} phase=password_change_pipeline success`,
      );
      return {
        navigationOk: true,
        notPresented: false,
        passwordChanged: pipeline.passwordChanged === true,
        notes: pipeline.notes,
      };
    } catch (err) {
      if (isPortalFillAbortRequested(options.abortSignal)) {
        return abortedResult();
      }
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `${logPrefix} phase=password_change_pipeline unexpected ${error}`,
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
