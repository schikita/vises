/**
 * Patchright navigation + fill façade for RegisterUser (DEC-006/007/010).
 * Lazy-loads patchright inside fillRegisterForm only (CON-006 / DEC-010).
 * Optional: skip CAPTCHA guard + click #btnVerify (env-gated).
 */
import { Injectable, Logger } from '@nestjs/common';
import type { IPortalFillService } from './interfaces';
import type {
  FillRegisterFormOptions,
  FillRegisterFormResult,
  PortalBrowser,
  PortalPatchrightModule,
} from './types';
import { normalizeTargetUrl, runPortalFillPipeline } from './utils';

@Injectable()
export class PortalFillService implements IPortalFillService {
  private readonly logger = new Logger(PortalFillService.name);

  /**
   * Navigate and fill RegisterUser from a mapping result.
   * Skipped/failed mapping fields are not written; CountryCode/EmailOtp never written.
   * Patchright is loaded only here (on-demand), never from API boot.
   */
  async fillRegisterForm(
    options: FillRegisterFormOptions,
  ): Promise<FillRegisterFormResult> {
    const targetUrl = normalizeTargetUrl(options.targetUrl);
    const fields = options.mapping.fields.map((f) => ({ ...f }));
    let browser: PortalBrowser | undefined;

    try {
      // Lazy/dynamic import — do not load browsers on Nest API boot (RISK-013).
      // Narrow to hand-written surface (DEC-006); do not eagerly import patchright types.
      const patchright = (await import(
        'patchright'
      )) as unknown as PortalPatchrightModule;
      const chromium = patchright.chromium;

      const launchOpts: {
        headless: boolean;
        channel?: string;
      } = { headless: !options.headed };
      if (options.browserChannel) {
        launchOpts.channel = options.browserChannel;
      }

      try {
        browser = await chromium.launch(launchOpts);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const error = `Browser launch failed (DEC-010: install browsers on host via \`npx patchright install\` or set VISES_PORTAL_BROWSER_CHANNEL): ${msg}`;
        this.logger.error(error);
        return {
          navigationOk: false,
          error,
          fields,
          verifyClicked: false,
          emailOtpTouched: false,
        };
      }

      const context = await browser.newContext();
      const page = await context.newPage();
      page.setDefaultTimeout(options.navTimeoutMs);
      page.setDefaultNavigationTimeout(options.navTimeoutMs);

      try {
        await page.goto(targetUrl, {
          waitUntil: 'domcontentloaded',
          timeout: options.navTimeoutMs,
        });
      } catch (err) {
        const error = `navigation failed: ${err instanceof Error ? err.message : String(err)}`;
        this.logger.error(error);
        return {
          navigationOk: false,
          error,
          fields,
          verifyClicked: false,
          emailOtpTouched: false,
        };
      }

      const pipeline = await runPortalFillPipeline({
        page,
        mapping: options.mapping,
        navTimeoutMs: options.navTimeoutMs,
        screenshotPath: options.screenshotPath,
        skipCaptchaGuard: options.skipCaptchaGuard === true,
        clickVerify: options.clickVerify === true,
      });

      const keepOpenMs = options.keepOpenMs ?? 0;
      if (keepOpenMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, keepOpenMs));
      }

      await context.close();

      if (!pipeline.ok) {
        this.logger.error(
          `fill pipeline failed: ${pipeline.error ?? 'unknown'}`,
        );
        return {
          navigationOk: false,
          error: pipeline.error,
          fields: pipeline.fields,
          verifyClicked: pipeline.verifyClicked,
          emailOtpTouched: false,
          usedStandIn: pipeline.usedStandIn,
        };
      }

      return {
        navigationOk: true,
        fields: pipeline.fields,
        countryCodeObserved: pipeline.countryCodeObserved,
        verifyClicked: pipeline.verifyClicked,
        emailOtpTouched: false,
        screenshotPath: pipeline.screenshotPath,
        usedStandIn: pipeline.usedStandIn,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(`fillRegisterForm unexpected error: ${error}`);
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
            `browser close failed: ${closeErr instanceof Error ? closeErr.message : String(closeErr)}`,
          );
        });
      }
    }
  }
}
