/**
 * Patchright navigation + login + status-validate facade (REQ-018 / REQ-019).
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
  FillPortalStatusValidateOptions,
  FillPortalStatusValidateResult,
} from './types/portal-status.types';
import type {
  PortalBrowser,
  PortalPatchrightModule,
} from './types/patchright-surface.types';
import { invokePortalFillBrowserLaunched } from './utils/invoke-portal-fill-browser-launched.util';
import { isPortalFillAbortRequested } from './utils/is-portal-fill-abort-requested.util';
import { runPortalStatusValidatePipeline } from './utils/run-portal-status-validate-pipeline.util';

@Injectable()
export class PortalStatusFillService {
  private readonly logger = new Logger(PortalStatusFillService.name);

  constructor(
    @Inject(CAPTCHA_PROVIDER)
    private readonly captchaProvider: CaptchaProvider,
  ) {}

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

    const abortedResult = (): FillPortalStatusValidateResult => ({
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

      this.logger.log(`${logPrefix} phase=status_validate_pipeline start`);
      const pipeline = await runPortalStatusValidatePipeline({
        page,
        portalFormEmail: options.portalFormEmail,
        portalPassword: options.portalPassword,
        manageApplicantsUrl,
        applicant: options.applicant,
        editFill: options.editFill,
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
          ...(pipeline.errorCode
            ? { errorCode: pipeline.errorCode }
            : {}),
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
      if (isPortalFillAbortRequested(options.abortSignal)) {
        return abortedResult();
      }
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
