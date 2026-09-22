/// <reference lib="dom" />
import {
  PORTAL_NAV_TIMEOUT_MS,
  PORTAL_REGISTER_USER_SELECTORS,
} from '../constants';
import type { PortalPage } from '../types';

/**
 * Wait until RegisterUser `#btnSubmit` is present and clickable, then click
 * (REQ-009 / DEC-019). Used only when `submitRegisterForm` is opted in.
 */
export const clickPortalRegisterSubmit = async (
  page: PortalPage,
): Promise<{ ok: true; via: string } | { ok: false; error: string }> => {
  const selector = PORTAL_REGISTER_USER_SELECTORS.submitControl;

  try {
    await page.waitForFunction(
      (sel: string) => {
        const btn = document.querySelector(sel) as HTMLButtonElement | null;
        if (!btn) return false;
        if (btn.disabled) return false;
        const style = window.getComputedStyle(btn);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return false;
        }
        return true;
      },
      selector,
      { timeout: PORTAL_NAV_TIMEOUT_MS },
    );
  } catch {
    return {
      ok: false,
      error: `${selector} not ready within ${PORTAL_NAV_TIMEOUT_MS}ms`,
    };
  }

  const clicked = await page.evaluate((sel: string) => {
    const btn = document.querySelector(sel) as HTMLButtonElement | null;
    if (!btn || btn.disabled) {
      return { ok: false as const, via: 'not-ready' };
    }
    btn.click();
    return { ok: true as const, via: sel };
  }, selector);

  if (!clicked.ok) {
    return { ok: false, error: `${selector} click failed (not ready)` };
  }
  return { ok: true, via: clicked.via };
};
