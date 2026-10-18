import type { BrowserMailSession } from '../types';

/**
 * True when Map session still has a live Patchright browser/page and address
 * (DEC-003 / RISK-007). Closed handles must not be reused.
 */
export const isBrowserMailSessionUsable = (
  session: BrowserMailSession,
): boolean => {
  try {
    if (!session.address?.trim()) {
      return false;
    }
    if (!session.browser.isConnected()) {
      return false;
    }
    if (session.page.isClosed()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};
