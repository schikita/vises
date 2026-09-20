/**
 * Patchright navigation + fill façade for RegisterUser (DEC-006/007/010).
 * Lazy-loads patchright inside fillRegisterForm only (CON-006 / DEC-010).
 */
import { Injectable, Logger } from '@nestjs/common';
import { CapMonsterService } from '../capmonster';
import { MailTmService } from '../mailtm';
import { PORTAL_KEEP_OPEN_MS, PORTAL_NAV_TIMEOUT_MS } from './constants';
import type { IPortalFormFiller } from './interfaces';
import type {
  FillRegisterFormOptions,
  FillRegisterFormResult,
  PortalBrowser,
  PortalPatchrightModule,
} from './types';
import {
  formatPortalLogContext,
  normalizeTargetUrl,
  runPortalFillPipeline,
} from './utils';

@Injectable()
export class PortalFillService implements IPortalFormFiller {
  private readonly logger = new Logger(PortalFillService.name);

  constructor(
    private readonly mailTm: MailTmService,
    private readonly capMonster: CapMonsterService,
  ) {}

  /**
   * Navigate and fill RegisterUser from a mapping result.
   * Skipped/failed mapping fields are not written; CountryCode never written.
   * EmailOtp written only when email OTP path is armed post-CapMonster.
   * Patchright is loaded only here (on-demand), never from API boot.
   */
  async fillRegisterForm(
    options: FillRegisterFormOptions,
  ): Promise<FillRegisterFormResult> {
    const targetUrl = normalizeTargetUrl(options.targetUrl);
    const fields = options.mapping.fields.map((f) => ({ ...f }));
    let browser: PortalBrowser | undefined;
    const logPrefix = formatPortalLogContext({
      applicationId: options.mapping.applicationId,
      applicantId: options.mapping.applicantId,
      runId: options.runId,
    });

    try {
      // Lazy/dynamic import — do not load browsers on Nest API boot (RISK-013).
      // Narrow to hand-written surface (DEC-006); do not eagerly import patchright types.
      const patchright = (await import(
        'patchright'
      )) as unknown as PortalPatchrightModule;
      const chromium = patchright.chromium;

      this.logger.log(`${logPrefix} phase=browser_launch start`);
      try {
        console.log('options.headed', options.headed);
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
        return {
          navigationOk: false,
          error,
          fields,
          verifyClicked: false,
          emailOtpTouched: false,
        };
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

      this.logger.log(`${logPrefix} phase=pipeline start`);
      const pipeline = await runPortalFillPipeline({
        page,
        mapping: options.mapping,
        screenshotPath: options.screenshotPath,
        capMonsterApiKey: options.capMonsterApiKey,
        capMonster: this.capMonster,
        otpPathArmed: options.otpPathArmed === true,
        mailTm: this.mailTm,
        runId: options.runId,
        checkpoint: options.checkpoint,
        captchaRestore: options.captchaRestore,
      });

      if (PORTAL_KEEP_OPEN_MS > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, PORTAL_KEEP_OPEN_MS),
        );
      }

      // await context.close();

      if (!pipeline.ok) {
        this.logger.error(
          `${logPrefix} phase=pipeline overall hard_failure ${pipeline.error ?? 'unknown'}`,
        );
        return {
          navigationOk: false,
          error: pipeline.error,
          fields: pipeline.fields,
          verifyClicked: pipeline.verifyClicked,
          emailOtpTouched: pipeline.emailOtpTouched,
          usedStandIn: pipeline.usedStandIn,
          screenshotPath: pipeline.screenshotPath,
          capMonsterAttempted: pipeline.capMonsterAttempted,
          capMonsterOk: pipeline.capMonsterOk,
          emailOtpAttempted: pipeline.emailOtpAttempted,
          emailOtpOk: pipeline.emailOtpOk,
          mailTmResendAttempts: pipeline.mailTmResendAttempts,
          mailTmCircuitOpen: pipeline.mailTmCircuitOpen,
          mailTmCleanup: pipeline.mailTmCleanup,
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
        capMonsterAttempted: pipeline.capMonsterAttempted,
        capMonsterOk: pipeline.capMonsterOk,
        emailOtpAttempted: pipeline.emailOtpAttempted,
        emailOtpOk: pipeline.emailOtpOk,
        mailTmResendAttempts: pipeline.mailTmResendAttempts,
        mailTmCircuitOpen: pipeline.mailTmCircuitOpen,
        mailTmCleanup: pipeline.mailTmCleanup,
      };
    } catch (err) {
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
      console.log('browser close');
      // if (browser) {
      //   await browser.close().catch((closeErr) => {
      //     this.logger.error(
      //       `${logPrefix} browser close failed: ${closeErr instanceof Error ? closeErr.message : String(closeErr)}`,
      //     );
      //   });
      // }
    }
  }
}
