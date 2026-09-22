import {
  PORTAL_NAV_TIMEOUT_MS,
  PORTAL_PASSWORD_CHANGE_SELECTORS,
} from '../constants';
import type { PortalPage } from '../types';

type ClickArg = {
  formActionSubstring: string;
  submitButtonText: string;
};

/**
 * Click "Update Password" on the forced-change form (`reset_password.html`).
 */
export const clickPortalPasswordChangeSubmit = async (
  page: PortalPage,
): Promise<{ ok: true; via: string } | { ok: false; error: string }> => {
  const arg: ClickArg = {
    formActionSubstring: PORTAL_PASSWORD_CHANGE_SELECTORS.formActionSubstring,
    submitButtonText: PORTAL_PASSWORD_CHANGE_SELECTORS.submitButtonText,
  };

  try {
    await page.waitForFunction(
      (a: ClickArg) => {
        const normalize = (text: string): string =>
          text.replace(/\s+/g, ' ').trim().toLowerCase();
        const needle = normalize(a.submitButtonText);
        const forms = Array.from(document.querySelectorAll('form'));
        const changeForm = forms.find((f) =>
          (f.getAttribute('action') ?? '').includes(a.formActionSubstring),
        );
        if (!changeForm) return false;
        const btn = Array.from(
          changeForm.querySelectorAll('button[type="submit"], input[type="submit"]'),
        ).find((el) => {
          const label =
            el instanceof HTMLInputElement
              ? el.value
              : (el.textContent ?? '');
          return normalize(label) === needle;
        }) as HTMLButtonElement | HTMLInputElement | undefined;
        if (!btn) return false;
        if ('disabled' in btn && btn.disabled) return false;
        const style = window.getComputedStyle(btn);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return false;
        }
        return true;
      },
      arg,
      { timeout: PORTAL_NAV_TIMEOUT_MS },
    );
  } catch {
    return {
      ok: false,
      error: `Update Password not ready within ${PORTAL_NAV_TIMEOUT_MS}ms`,
    };
  }

  const clicked = await page.evaluate((a: ClickArg) => {
    const normalize = (text: string): string =>
      text.replace(/\s+/g, ' ').trim().toLowerCase();
    const needle = normalize(a.submitButtonText);
    const forms = Array.from(document.querySelectorAll('form'));
    const changeForm = forms.find((f) =>
      (f.getAttribute('action') ?? '').includes(a.formActionSubstring),
    );
    if (!changeForm) {
      return { ok: false as const, via: 'form-missing' };
    }
    const btn = Array.from(
      changeForm.querySelectorAll('button[type="submit"], input[type="submit"]'),
    ).find((el) => {
      const label =
        el instanceof HTMLInputElement ? el.value : (el.textContent ?? '');
      return normalize(label) === needle;
    }) as HTMLButtonElement | HTMLInputElement | undefined;
    if (!btn || ('disabled' in btn && btn.disabled)) {
      return { ok: false as const, via: 'not-ready' };
    }
    btn.click();
    return { ok: true as const, via: 'Update Password' };
  }, arg);

  if (!clicked.ok) {
    return { ok: false, error: `Update Password click failed (${clicked.via})` };
  }
  return { ok: true, via: clicked.via };
};
