import {
  BROWSER_MAIL_NAV_TIMEOUT_MS,
  BROWSER_MAIL_SELECTOR,
  BROWSER_MAIL_SESSION_CLOSED_ERROR,
  BROWSER_MAIL_UI_PACE_MS,
} from '../constants';
import type { BrowserMailInboxRow, BrowserMailPage } from '../types';
import { browserMailSleep } from './browser-mail-sleep.util';
import { isBrowserMailSessionClosedError } from './is-browser-mail-session-closed-error.util';

/**
 * Click the newest eligible inbox row (smallest DOM index among eligible) (REQ-005).
 * Paces ~1 s after open (REQ-008). Maps closed browser to stable code (DEC-004).
 */
export const clickBrowserMailInboxRow = async (
  page: BrowserMailPage,
  rows: BrowserMailInboxRow[],
  eligibleRowIds: ReadonlySet<string>,
): Promise<BrowserMailInboxRow> => {
  const eligible = rows
    .filter((row) => eligibleRowIds.has(row.rowId))
    .sort((a, b) => a.index - b.index);
  const target = eligible[0];
  if (!target) {
    throw new Error('browser_mail_inbox_row_missing');
  }

  const locator = page.locator(BROWSER_MAIL_SELECTOR.MAIL_ROW).nth(target.index);
  try {
    await locator.click({ timeout: BROWSER_MAIL_NAV_TIMEOUT_MS });
    await page.waitForSelector(BROWSER_MAIL_SELECTOR.LETTER, {
      state: 'visible',
      timeout: BROWSER_MAIL_NAV_TIMEOUT_MS,
    });
  } catch (err) {
    if (isBrowserMailSessionClosedError(err)) {
      throw new Error(BROWSER_MAIL_SESSION_CLOSED_ERROR);
    }
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`browser_mail_inbox_row_click_failed: ${detail}`);
  }

  await browserMailSleep(BROWSER_MAIL_UI_PACE_MS);
  return target;
};
