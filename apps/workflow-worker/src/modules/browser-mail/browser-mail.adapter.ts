import { Injectable, Logger } from '@nestjs/common';
import {
  extractDataProtectionConsentHref as extractDataProtectionConsentHrefFromBody,
  extractTemporaryEmailOtp,
  extractTemporaryEmailPortalPassword,
  temporaryEmailSubjectIncludes,
} from '../temporary-email';
import type { TemporaryEmailProvider } from '../temporary-email';
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
} from '../temporary-email';
import { BrowserSessionBudgetService } from '../portal-core/browser-session-budget.service';
import { PORTAL_CONCURRENCY_CAP_HIT } from '../portal-core/constants/browser-session-budget.constants';
import { BrowserMailSessionStore } from './browser-mail-session.store';
import {
  BROWSER_MAIL_BASE_URL,
  BROWSER_MAIL_DELETE_SOFT_SKIP,
  BROWSER_MAIL_LAUNCH_TIMEOUT_MS,
  BROWSER_MAIL_NAV_TIMEOUT_MS,
  BROWSER_MAIL_POLL_INTERVAL_MS,
  BROWSER_MAIL_SELECTOR,
  BROWSER_MAIL_SESSION_CLOSED_ERROR,
  BROWSER_MAIL_SESSION_MISSING_ERROR,
  BROWSER_MAIL_UI_PACE_MS,
} from './constants';
import type {
  BrowserMailPatchrightModule,
  BrowserMailSession,
} from './types';
import {
  browserMailSleep,
  clickBrowserMailBack,
  clickBrowserMailInboxRow,
  generateBrowserMailLocalPart,
  isBrowserMailSessionClosedError,
  isBrowserMailSessionUsable,
  listBrowserMailInboxRows,
  pickRandomBrowserMailDomainOption,
  readBrowserMailLetterBody,
  restoreBrowserMailIdentity,
  waitBrowserMailInboxVisible,
} from './utils';

/**
 * Purpose-named temporary-email adapter driving tempmail.plus via Patchright
 * (REQ-008…012 / DEC-008 / DEC-009 / DEC-012 / DEC-015).
 * Direct egress — no Proxy6. No temporary email HTTP. Lazy-imports Patchright.
 * Chromium always headed (`headless: false`) — DEC-002 / REQ-001; no env gate.
 * Launch gated by shared portal+mail session budget (REQ-006 / DEC-012).
 */
@Injectable()
export class BrowserMailAdapter implements TemporaryEmailProvider {
  private readonly logger = new Logger(BrowserMailAdapter.name);

  constructor(
    private readonly sessions: BrowserMailSessionStore,
    private readonly sessionBudget: BrowserSessionBudgetService,
  ) {}

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
      // DEC-003: reuse live Map session for contextKey; dispose only for
      // intentional replace (dead handle) or via deleteAccount / disposeSession.
      const restoreAddress = input.restoreAddress?.trim() || undefined;
      const existing = this.sessions.get(contextKey);
      if (existing) {
        if (isBrowserMailSessionUsable(existing)) {
          this.logger.log(
            `browser_mail_create reuse contextKey=${contextKey}`,
          );
          // REQ-010: restore local+domain on live page without reload.
          const identity = restoreAddress ?? existing.address;
          await restoreBrowserMailIdentity(existing.page, identity);
          return {
            id: `browser:${contextKey}`,
            address: identity.trim().toLowerCase(),
            token: '',
            password: '',
          };
        }
        this.logger.log(
          `browser_mail_create replace_dead_session contextKey=${contextKey}`,
        );
        // Preserve address before dispose for recreate+identity (DEC-003).
        const priorAddress = restoreAddress ?? existing.address;
        await this.sessions.dispose(contextKey);
        return this.launchNewSession(contextKey, priorAddress);
      }

      return this.launchNewSession(contextKey, restoreAddress);
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
      if (!isBrowserMailSessionUsable(session)) {
        throw new Error(BROWSER_MAIL_SESSION_CLOSED_ERROR);
      }
      // DEC-006: unreadOnly ignored — list UI has no reliable unread flag.
      void input.unreadOnly;
      const excludeIds = new Set(
        (input.excludeMessageIds ?? [])
          .map((id) => id.trim())
          .filter((id) => id.length > 0),
      );

      // DEC-004: baseline only at each waitLatestMessage entry.
      // includeExisting + subjectIncludes: also match pre-baseline rows (BOOK DP).
      let baselineRows;
      try {
        baselineRows = await listBrowserMailInboxRows(session.page);
      } catch (err) {
        if (isBrowserMailSessionClosedError(err)) {
          throw new Error(BROWSER_MAIL_SESSION_CLOSED_ERROR);
        }
        throw err;
      }
      const baselineIds = new Set(baselineRows.map((row) => row.rowId));
      const includeExisting =
        input.includeExisting === true &&
        (input.subjectIncludes?.trim() ?? '').length > 0;
      const started = Date.now();

      while (Date.now() - started < input.timeoutMs) {
        try {
          if (!isBrowserMailSessionUsable(session)) {
            throw new Error(BROWSER_MAIL_SESSION_CLOSED_ERROR);
          }

          const rows = await listBrowserMailInboxRows(session.page);
          const eligible = rows.filter(
            (row) =>
              !excludeIds.has(row.rowId) &&
              temporaryEmailSubjectIncludes(
                row.subjectPreview,
                input.subjectIncludes,
              ) &&
              (includeExisting || !baselineIds.has(row.rowId)),
          );

          if (eligible.length > 0) {
            const eligibleIds = new Set(eligible.map((row) => row.rowId));
            const opened = await clickBrowserMailInboxRow(
              session.page,
              rows,
              eligibleIds,
            );
            const body = await readBrowserMailLetterBody(session.page);

            // DEC-005: restore inbox after success and after empty-body opens.
            await clickBrowserMailBack(session.page);

            if (body.length > 0) {
              this.logger.log(
                `browser_mail_wait success contextKey=${contextKey} messageId=${opened.rowId}`,
              );
              return {
                messageId: opened.rowId,
                body,
              };
            }
          }
        } catch (err) {
          // Mid-wait closed: fail closed — do not recreate in poll loop (DEC-003).
          if (isBrowserMailSessionClosedError(err)) {
            throw new Error(BROWSER_MAIL_SESSION_CLOSED_ERROR);
          }
          throw err;
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
    return extractTemporaryEmailOtp(input);
  }

  extractPortalPassword(
    input: ExtractTemporaryEmailPortalPasswordInput,
  ): ExtractTemporaryEmailPortalPasswordResult {
    return extractTemporaryEmailPortalPassword(input);
  }

  extractDataProtectionConsentHref(body: string): string | null {
    return extractDataProtectionConsentHrefFromBody(body);
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

  /**
   * Launch headed Chromium + one goto; optionally restore prior local@domain
   * (DEC-003). Random identity when `restoreAddress` is omitted.
   */
  private async launchNewSession(
    contextKey: string,
    restoreAddress?: string,
  ): Promise<TemporaryMailboxAccount> {
    if (!this.sessionBudget.tryAcquireSession('mail')) {
      throw new Error(PORTAL_CONCURRENCY_CAP_HIT);
    }
    let sessionSlotHeld = true;
    let browser: BrowserMailSession['browser'] | undefined;
    try {
      const patchright = (await import(
        'patchright'
      )) as unknown as BrowserMailPatchrightModule;
      // Always headed — DEC-002 / REQ-001 (no NODE_ENV / env gate).
      browser = await patchright.chromium.launch({
        headless: false,
        channel: 'chrome',
        timeout: BROWSER_MAIL_LAUNCH_TIMEOUT_MS,
      });
    } catch (err) {
      if (sessionSlotHeld) {
        this.sessionBudget.releaseSession('mail');
        sessionSlotHeld = false;
      }
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

      let address: string;
      if (restoreAddress?.trim()) {
        await restoreBrowserMailIdentity(page, restoreAddress);
        address = restoreAddress.trim().toLowerCase();
      } else {
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

        await waitBrowserMailInboxVisible(page);
        address = `${localPart}@${domain}`.toLowerCase();
      }

      // REQ-008: pace after new session open (inbox visible).
      await browserMailSleep(BROWSER_MAIL_UI_PACE_MS);

      const session: BrowserMailSession = {
        contextKey,
        address,
        browser,
        context,
        page,
        createdAtMs: Date.now(),
      };
      this.sessions.set(session);
      // Slot held until store.dispose → releaseSession('mail').
      sessionSlotHeld = false;
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
      if (sessionSlotHeld) {
        this.sessionBudget.releaseSession('mail');
      }
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`browser_mail_create_failed: ${msg}`);
    }
  }
}
