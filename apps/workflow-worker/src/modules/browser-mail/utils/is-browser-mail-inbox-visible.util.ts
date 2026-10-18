import { BROWSER_MAIL_SELECTOR } from '../constants';
import type { BrowserMailPage } from '../types';

/**
 * True when inbox list chrome is already visible (DEC-005 idempotent `#back`).
 */
export const isBrowserMailInboxVisible = async (
  page: BrowserMailPage,
): Promise<boolean> => {
  return page.evaluate((inboxSelector: string): boolean => {
    const el = document.querySelector(inboxSelector);
    if (!el) {
      return false;
    }
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }, BROWSER_MAIL_SELECTOR.INBOX);
};
