/**
 * Patchright navigation + login Email-verify prep façade (DEC-002 / DEC-010 / DEC-012).
 * Lazy-loads patchright only when invoked — never at API boot.
 */
import { Injectable, Logger } from '@nestjs/common';
import { CapMonsterService } from '../capmonster';
import { PORTAL_KEEP_OPEN_MS, PORTAL_NAV_TIMEOUT_MS } from './constants';
import type {
  FillPortalLoginPrepOptions,
  FillPortalLoginPrepResult,
  PortalBrowser,
  PortalPatchrightModule,
} from './types';
import {
  formatPortalLogContext,
  normalizeTargetUrl,
  runPortalLoginPrepPipeline,
} from './utils';

@Injectable()
export class PortalLoginPrepFillService {
  private readonly logger = new Logger(PortalLoginPrepFillService.name);

  constructor(private readonly capMonster: CapMonsterService) {}

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
        return {
          navigationOk: false,
          error,
          emailFilled: false,
          verifyClicked: false,
          capMonsterAttempted: false,
          capMonsterOk: false,
          notes: emptyNotes,
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
        const error = `navigation failed: ${
          err instanceof Error ? err.message : String(err)
        }`;
        this.logger.error(`${logPrefix} phase=navigation failure ${error}`);
        return {
          navigationOk: false,
          error,
          emailFilled: false,
          verifyClicked: false,
          capMonsterAttempted: false,
          capMonsterOk: false,
          notes: emptyNotes,
        };
      }

      this.logger.log(`${logPrefix} phase=login_prep_pipeline start`);
      const pipeline = await runPortalLoginPrepPipeline({
        page,
        portalFormEmail: options.portalFormEmail,
        screenshotPath: options.screenshotPath,
        capMonsterApiKey: options.capMonsterApiKey,
        capMonster: this.capMonster,
        logPrefix,
        submitPassword: options.submitPassword === true,
        portalPassword: options.portalPassword,
      });

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
          emailFilled: pipeline.emailFilled,
          verifyClicked: pipeline.verifyClicked,
          capMonsterAttempted: pipeline.capMonsterAttempted,
          capMonsterOk: pipeline.capMonsterOk,
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
        capMonsterAttempted: pipeline.capMonsterAttempted,
        capMonsterOk: pipeline.capMonsterOk,
        passwordFilled: pipeline.passwordFilled,
        passwordSubmitted: pipeline.passwordSubmitted,
        passwordSubmitAmbiguous: pipeline.passwordSubmitAmbiguous,
        loginAuthenticatedVerified: pipeline.loginAuthenticatedVerified,
        screenshotPath: pipeline.screenshotPath,
        notes: pipeline.notes,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `${logPrefix} phase=login_prep_pipeline unexpected ${error}`,
      );
      return {
        navigationOk: false,
        error,
        emailFilled: false,
        verifyClicked: false,
        capMonsterAttempted: false,
        capMonsterOk: false,
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
