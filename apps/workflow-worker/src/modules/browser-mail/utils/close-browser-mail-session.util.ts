import type { BrowserMailSession } from '../types';

/**
 * Best-effort close of Patchright browser/context for a session entry.
 * Never throws; order: context → browser (page closes with context).
 */
export const closeBrowserMailSession = async (
  session: BrowserMailSession,
): Promise<void> => {
  try {
    await session.context.close();
  } catch {
    // ignore — already closed
  }
  try {
    await session.browser.close();
  } catch {
    // ignore — already closed
  }
};
