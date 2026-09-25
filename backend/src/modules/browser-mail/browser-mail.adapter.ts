import { Injectable, Logger } from '@nestjs/common';
import {
  extractMailTmOtp,
  extractMailTmPortalPassword,
} from '../mailtm';
import type { TemporaryEmailProvider } from '../mailtm';
import type {
  CreateTemporaryMailboxInput,
  DeleteTemporaryMailboxInput,
  DeleteTemporaryMailboxResult,
  ExtractTemporaryEmailOtpInput,
  ExtractTemporaryEmailOtpResult,
  ExtractTemporaryEmailPortalPasswordInput,
  ExtractTemporaryEmailPortalPasswordResult,
  TemporaryEmailCallOptions,
  TemporaryMailboxAccount,
  WaitTemporaryEmailMessageInput,
  WaitTemporaryEmailMessageResult,
} from '../mailtm';
import { BrowserMailSessionStore } from './browser-mail-session.store';
import {
  BROWSER_MAIL_BASE_URL,
  BROWSER_MAIL_DELETE_SOFT_SKIP,
  BROWSER_MAIL_NAV_TIMEOUT_MS,
  BROWSER_MAIL_POLL_INTERVAL_MS,
  BROWSER_MAIL_SELECTOR,
  BROWSER_MAIL_SESSION_MISSING_ERROR,
} from './constants';
import type {
  BrowserMailPatchrightModule,
  BrowserMailSession,
} from './types';
import {
  browserMailSleep,
  generateBrowserMailLocalPart,
  pickRandomBrowserMailDomainOption,
  scrapeBrowserMailLetters,
} from './utils';

/**
 * Purpose-named temporary-email adapter driving tempmail.plus via Patchright
 * (REQ-008…012 / DEC-008 / DEC-009 / DEC-012 / DEC-015).
 * Direct egress — no Proxy6. No Mail.tm HTTP. Lazy-imports Patchright.
 */
@Injectable()
export class BrowserMailAdapter implements TemporaryEmailProvider {
  private readonly logger = new Logger(BrowserMailAdapter.name);

  constructor(private readonly sessions: BrowserMailSessionStore) {}

  async createAccount(
    input: CreateTemporaryMailboxInput,
    options?: TemporaryEmailCallOptions,
  ): Promise<TemporaryMailboxAccount> {
    void options;
    const contextKey = input.contextKey.trim();
    if (!contextKey) {
      throw new Error(BROWSER_MAIL_SESSION_MISSING_ERROR);
    }

    return this.sessions.withLock(contextKey, async () => {
      await this.sessions.dispose(contextKey);

      let browser: BrowserMailSession['browser'] | undefined;
      try {
        const patchright = (await import(
          'patchright'
        )) as unknown as BrowserMailPatchrightModule;
        browser = await patchright.chromium.launch({
          headless: true,
          channel: 'chrome',
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(
          `Browser mail launch failed (install Chrome via \`npx patchright install chrome\`): ${msg}`,
        );
      }

      try {
        const context = await browser.newContext();
        const page = await context.newPage();
        page.setDefaultTimeout(BROWSER_MAIL_NAV_TIMEOUT_MS);
        page.setDefaultNavigationTimeout(BROWSER_MAIL_NAV_TIMEOUT_MS);

        await page.goto(BROWSER_MAIL_BASE_URL, {
          waitUntil: 'domcontentloaded',
          timeout: BROWSER_MAIL_NAV_TIMEOUT_MS,
        });

        await page.waitForSelector(BROWSER_MAIL_SELECTOR.PRE_BUTTON, {
          state: 'visible',
          timeout: BROWSER_MAIL_NAV_TIMEOUT_MS,
        });

        const localPart = generateBrowserMailLocalPart();
        await page.locator(BROWSER_MAIL_SELECTOR.PRE_BUTTON).fill(localPart);

        await page.locator(BROWSER_MAIL_SELECTOR.DOMAIN).click();
        await page.waitForSelector(BROWSER_MAIL_SELECTOR.DOMAIN_DROPDOWN_ITEMS, {
          state: 'visible',
          timeout: BROWSER_MAIL_NAV_TIMEOUT_MS,
        });

        const itemCount = await page
          .locator(BROWSER_MAIL_SELECTOR.DOMAIN_DROPDOWN_ITEMS)
          .count();
        const domainLabels: string[] = [];
        for (let i = 0; i < itemCount; i += 1) {
          const text = await page
            .locator(BROWSER_MAIL_SELECTOR.DOMAIN_DROPDOWN_ITEMS)
            .nth(i)
            .textContent();
          if (text?.trim()) {
            domainLabels.push(text.trim());
          }
        }

        const domain = pickRandomBrowserMailDomainOption(domainLabels);
        const domainIndex = domainLabels.findIndex(
          (label) =>
            label.trim().replace(/^@/, '').toLowerCase() ===
            domain.toLowerCase(),
        );
        const pickIndex = domainIndex >= 0 ? domainIndex : 0;
        await page
          .locator(BROWSER_MAIL_SELECTOR.DOMAIN_DROPDOWN_ITEMS)
          .nth(pickIndex)
          .click();

        const address = `${localPart}@${domain}`.toLowerCase();
        const session: BrowserMailSession = {
          contextKey,
          address,
          browser,
          context,
          page,
          createdAtMs: Date.now(),
        };
        this.sessions.set(session);
        this.logger.log(
          `browser_mail_create success contextKey=${contextKey} address=${address}`,
        );

        return {
          id: `browser:${contextKey}`,
          address,
          token: '',
          password: '',
        };
      } catch (err) {
        try {
          await browser.close();
        } catch {
          // ignore
        }
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`browser_mail_create_failed: ${msg}`);
      }
    });
  }

  async waitLatestMessage(
    input: WaitTemporaryEmailMessageInput,
    options?: TemporaryEmailCallOptions,
  ): Promise<WaitTemporaryEmailMessageResult> {
    void options;
    const contextKey = input.contextKey.trim();
    if (!contextKey) {
      throw new Error(BROWSER_MAIL_SESSION_MISSING_ERROR);
    }

    return this.sessions.withLock(contextKey, async () => {
      const session = this.sessions.require(contextKey);
      const excludeIds = new Set(
        (input.excludeMessageIds ?? [])
          .map((id) => id.trim())
          .filter((id) => id.length > 0),
      );
      const started = Date.now();

      while (Date.now() - started < input.timeoutMs) {
        const letters = await scrapeBrowserMailLetters(session.page);
        const eligible =
          excludeIds.size === 0
            ? letters
            : letters.filter((letter) => !excludeIds.has(letter.messageId));
        const picked = eligible[0];
        if (picked) {
          this.logger.log(
            `browser_mail_wait success contextKey=${contextKey} messageId=${picked.messageId}`,
          );
          return {
            messageId: picked.messageId,
            body: picked.body,
          };
        }

        const remaining = input.timeoutMs - (Date.now() - started);
        if (remaining <= 0) {
          break;
        }
        await browserMailSleep(
          Math.min(BROWSER_MAIL_POLL_INTERVAL_MS, remaining),
        );
      }

      throw new Error(
        `browser_mail_wait_timeout contextKey=${contextKey} timeoutMs=${input.timeoutMs}`,
      );
    });
  }

  extractOtp(
    input: ExtractTemporaryEmailOtpInput,
  ): ExtractTemporaryEmailOtpResult {
    return extractMailTmOtp(input);
  }

  extractPortalPassword(
    input: ExtractTemporaryEmailPortalPasswordInput,
  ): ExtractTemporaryEmailPortalPasswordResult {
    return extractMailTmPortalPassword(input);
  }

  /**
   * Soft-skip HTTP delete; dispose browser session so failure paths free Chrome
   * (DEC-006 / REQ-008).
   */
  async deleteAccount(
    input: DeleteTemporaryMailboxInput,
  ): Promise<DeleteTemporaryMailboxResult> {
    const contextKey = input.contextKey.trim();
    if (contextKey) {
      await this.disposeSession(contextKey);
    }
    return {
      ok: true,
      warnMessage: BROWSER_MAIL_DELETE_SOFT_SKIP,
    };
  }

  async disposeSession(
    contextKey: string,
  ): Promise<DeleteTemporaryMailboxResult> {
    const key = contextKey.trim();
    if (!key) {
      return { ok: true };
    }
    try {
      await this.sessions.withLock(key, async () => {
        await this.sessions.dispose(key);
      });
      return { ok: true };
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'dispose_failed';
      return { ok: false, warnMessage: detail };
    }
  }
}
