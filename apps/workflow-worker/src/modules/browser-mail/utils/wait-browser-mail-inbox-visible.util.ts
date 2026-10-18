import {
  BROWSER_MAIL_NAV_TIMEOUT_MS,
  BROWSER_MAIL_SELECTOR,
} from '../constants';
import type { BrowserMailPage } from '../types';

/**
 * Bounded wait until `div.inbox` is visible (DEC-003 create harden / DEC-005 restore).
 */
export const waitBrowserMailInboxVisible = async (
  page: BrowserMailPage,
): Promise<void> => {
  try {
    await page.waitForSelector(BROWSER_MAIL_SELECTOR.INBOX, {
      state: 'visible',
      timeout: BROWSER_MAIL_NAV_TIMEOUT_MS,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`browser_mail_inbox_not_ready: ${detail}`);
  }
};
