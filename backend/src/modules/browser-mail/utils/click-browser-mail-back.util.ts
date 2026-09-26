import {
  BROWSER_MAIL_NAV_TIMEOUT_MS,
  BROWSER_MAIL_SELECTOR,
  BROWSER_MAIL_SESSION_CLOSED_ERROR,
  BROWSER_MAIL_UI_PACE_MS,
} from '../constants';
import type { BrowserMailPage } from '../types';
import { browserMailSleep } from './browser-mail-sleep.util';
import { isBrowserMailInboxVisible } from './is-browser-mail-inbox-visible.util';
import { isBrowserMailSessionClosedError } from './is-browser-mail-session-closed-error.util';
import { waitBrowserMailInboxVisible } from './wait-browser-mail-inbox-visible.util';

/**
 * Click `#back` and restore usable inbox (REQ-008 / DEC-005).
 * Idempotent when inbox is already visible. Fail closed if restore times out.
 * Paces ~1 s after back (REQ-008).
 */
export const clickBrowserMailBack = async (
  page: BrowserMailPage,
): Promise<void> => {
  if (await isBrowserMailInboxVisible(page)) {
    return;
  }

  try {
    await page.locator(BROWSER_MAIL_SELECTOR.BACK).click({
      timeout: BROWSER_MAIL_NAV_TIMEOUT_MS,
    });
    await waitBrowserMailInboxVisible(page);
    await browserMailSleep(BROWSER_MAIL_UI_PACE_MS);
  } catch (err) {
    if (isBrowserMailSessionClosedError(err)) {
      throw new Error(BROWSER_MAIL_SESSION_CLOSED_ERROR);
    }
    if (await isBrowserMailInboxVisible(page)) {
      return;
    }
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`browser_mail_back_failed: ${detail}`);
  }
};
