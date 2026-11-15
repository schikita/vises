/// <reference lib="dom" />
import {
  PORTAL_BOOKING_PAGE_WAIT_MS,
  PORTAL_BOOKING_SELECTORS,
} from '../constants';
import type { PortalPage } from '../types';

/**
 * Click VisaType Selection `#btnSubmit` (onclick → `OnSubmitVisaType`)
 * after form ready (REQ-012 / CON-005 / DEC-001 / VT-TASK-007).
 * Never clicks Premium Lounge Accept or payment confirm.
 */
export const clickPortalVisaTypeSubmit = async (
  page: PortalPage,
): Promise<{ ok: true; via: string } | { ok: false; error: string }> => {
  const selector = `#${PORTAL_BOOKING_SELECTORS.visaTypeSubmitButtonId}`;

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
      { timeout: PORTAL_BOOKING_PAGE_WAIT_MS },
    );
  } catch {
    return {
      ok: false,
      error: `${selector} not ready within ${PORTAL_BOOKING_PAGE_WAIT_MS}ms`,
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
