import {
  PORTAL_NAV_TIMEOUT_MS,
  PORTAL_STATUS_SELECTORS,
} from '../constants';
import type { PortalPage } from '../types';

type ProceedArg = {
  modalId: string;
  proceedOnclickNeedle: string;
  proceedButtonText: string;
};

/**
 * Click Proceed on `#visaTypeModal` (`VisaTypeProceed()`).
 * Never clicks Cancel / Close (CON-005).
 */
export const clickPortalVisaTypeModalProceed = async (
  page: PortalPage,
): Promise<{ ok: true; via: string } | { ok: false; error: string }> => {
  const arg: ProceedArg = {
    modalId: PORTAL_STATUS_SELECTORS.visaTypeModalId,
    proceedOnclickNeedle:
      PORTAL_STATUS_SELECTORS.visaTypeModalProceedOnclickNeedle,
    proceedButtonText: PORTAL_STATUS_SELECTORS.visaTypeModalProceedButtonText,
  };

  try {
    await page.waitForFunction(
      (a: ProceedArg) => {
        const collapse = (text: string): string =>
          text.replace(/\s+/g, ' ').trim().toLowerCase();
        const modal = document.getElementById(a.modalId) ?? document;
        const buttons = Array.from(
          modal.querySelectorAll('button.btn-success, .modal-footer button'),
        );
        return buttons.some((btn) => {
          if (!(btn instanceof HTMLButtonElement) || btn.disabled) {
            return false;
          }
          const onclick = btn.getAttribute('onclick') ?? '';
          if (!onclick.includes(a.proceedOnclickNeedle)) {
            return false;
          }
          if (btn.getAttribute('data-bs-dismiss') === 'modal') {
            return false;
          }
          return (
            collapse(btn.textContent ?? '') === collapse(a.proceedButtonText)
          );
        });
      },
      arg,
      { timeout: PORTAL_NAV_TIMEOUT_MS },
    );
  } catch {
    return {
      ok: false,
      error: `visaTypeModal Proceed not ready within ${PORTAL_NAV_TIMEOUT_MS}ms`,
    };
  }

  const clicked = await page.evaluate((a: ProceedArg) => {
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim().toLowerCase();
    const modal = document.getElementById(a.modalId) ?? document;
    const btn = Array.from(
      modal.querySelectorAll('button.btn-success, .modal-footer button'),
    ).find((el) => {
      if (!(el instanceof HTMLButtonElement) || el.disabled) {
        return false;
      }
      const onclick = el.getAttribute('onclick') ?? '';
      if (!onclick.includes(a.proceedOnclickNeedle)) {
        return false;
      }
      if (el.getAttribute('data-bs-dismiss') === 'modal') {
        return false;
      }
      return collapse(el.textContent ?? '') === collapse(a.proceedButtonText);
    }) as HTMLButtonElement | undefined;

    if (!btn) {
      return { ok: false as const, via: 'proceed-missing' };
    }
    btn.click();
    return { ok: true as const, via: a.proceedButtonText };
  }, arg);

  if (!clicked.ok) {
    return {
      ok: false,
      error: `visaTypeModal Proceed click failed (${clicked.via})`,
    };
  }
  return { ok: true, via: clicked.via };
};
