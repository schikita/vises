/**
 * Patchright navigation + login + conditional password-change façade (REQ-012).
 * Lazy-loads patchright only when invoked — never at API boot.
 */
import { Injectable, Logger } from '@nestjs/common';
import { CapMonsterService } from '../capmonster';
import { PORTAL_KEEP_OPEN_MS, PORTAL_NAV_TIMEOUT_MS } from './constants';
import type {
  FillPortalPasswordChangeOptions,
  FillPortalPasswordChangeResult,
  PortalBrowser,
  PortalPatchrightModule,
} from './types';
import {
  formatPortalLogContext,
  normalizeTargetUrl,
  runPortalPasswordChangePipeline,
} from './utils';

@Injectable()
export class PortalPasswordChangeFillService {
  private readonly logger = new Logger(PortalPasswordChangeFillService.name);

  constructor(private readonly capMonster: CapMonsterService) {}

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
        return { navigationOk: false, error, notes: emptyNotes };
      }

      this.logger.log(`${logPrefix} phase=password_change_pipeline start`);
      const pipeline = await runPortalPasswordChangePipeline({
        page,
        portalFormEmail: options.portalFormEmail,
        currentPassword: options.currentPassword,
        newPassword: options.newPassword,
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
          `${logPrefix} phase=password_change_pipeline hard_failure ${pipeline.error ?? 'unknown'}`,
        );
        return {
          navigationOk: false,
          submitAmbiguous: pipeline.submitAmbiguous,
          error: pipeline.error,
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
