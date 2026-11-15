import {
  PORTAL_BOOKING_SELECTORS,
  PORTAL_NAV_TIMEOUT_MS,
} from '../constants';
import type { PortalPage } from '../types';

type ModalArg = {
  familyDisclaimerModalId: string;
  familyModalTitleText: string;
  familyAcceptButtonText: string;
};

/**
 * Accept the Family Appointment modal (`#familyDisclaimer`) when present;
 * no-op when absent. Clicks only the success Accept **inside** that modal —
 * never Premium Lounge `#PremiumTypeModel` Accept (CON-006).
 */
export const acceptPortalFamilyDisclaimerModal = async (
  page: PortalPage,
): Promise<
  | { ok: true; accepted: boolean; via?: string }
  | { ok: false; error: string }
> => {
  const arg: ModalArg = {
    familyDisclaimerModalId: PORTAL_BOOKING_SELECTORS.familyDisclaimerModalId,
    familyModalTitleText: PORTAL_BOOKING_SELECTORS.familyModalTitleText,
    familyAcceptButtonText: PORTAL_BOOKING_SELECTORS.familyAcceptButtonText,
  };

  const present = await page.evaluate((a: ModalArg) => {
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim().toLowerCase();
    const byId = document.getElementById(a.familyDisclaimerModalId);
    if (byId) {
      const style = window.getComputedStyle(byId);
      if (style.display !== 'none' && style.visibility !== 'hidden') {
        return true;
      }
    }
    const titleNeedle = collapse(a.familyModalTitleText);
    const titles = Array.from(
      document.querySelectorAll(`#${a.familyDisclaimerModalId} .modal-title`),
    );
    return titles.some((el) =>
      collapse(el.textContent ?? '').includes(titleNeedle),
    );
  }, arg);

  if (!present) {
    return { ok: true, accepted: false };
  }

  try {
    await page.waitForFunction(
      (a: ModalArg) => {
        const collapse = (text: string): string =>
          text.replace(/\s+/g, ' ').trim().toLowerCase();
        const root = document.getElementById(a.familyDisclaimerModalId);
        if (!root) return false;
        const needle = collapse(a.familyAcceptButtonText);
        const buttons = Array.from(
          root.querySelectorAll(
            'button.btn-success, .modal-footer button',
          ),
        );
        return buttons.some((btn) => {
          const label = collapse(btn.textContent ?? '');
          if (label !== needle) return false;
          if ('disabled' in btn && (btn as HTMLButtonElement).disabled) {
            return false;
          }
          return true;
        });
      },
      arg,
      { timeout: PORTAL_NAV_TIMEOUT_MS },
    );
  } catch {
    return {
      ok: false,
      error: `Family disclaimer Accept not ready within ${PORTAL_NAV_TIMEOUT_MS}ms`,
    };
  }

  const clicked = await page.evaluate((a: ModalArg) => {
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim().toLowerCase();
    const root = document.getElementById(a.familyDisclaimerModalId);
    if (!root) {
      return { ok: false as const, via: 'modal-missing' };
    }
    const needle = collapse(a.familyAcceptButtonText);
    const btn = Array.from(
      root.querySelectorAll('button.btn-success, .modal-footer button'),
    ).find((el) => collapse(el.textContent ?? '') === needle) as
      | HTMLButtonElement
      | undefined;
    if (!btn || btn.disabled) {
      return { ok: false as const, via: 'not-ready' };
    }
    btn.click();
    return { ok: true as const, via: a.familyAcceptButtonText };
  }, arg);

  if (!clicked.ok) {
    return {
      ok: false,
      error: `Family disclaimer Accept click failed (${clicked.via})`,
    };
  }
  return { ok: true, accepted: true, via: clicked.via };
};
