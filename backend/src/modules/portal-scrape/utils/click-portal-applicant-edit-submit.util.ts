import {
  PORTAL_NAV_TIMEOUT_MS,
  PORTAL_STATUS_SELECTORS,
} from '../constants';
import type { PortalPage } from '../types';

type ClickArg = {
  editFormId: string;
  editFormActionSubstring: string;
  submitButtonText: string;
};

/**
 * Click Submit on the Edit Member / ManageApplicant form (`edit_app.html`).
 */
export const clickPortalApplicantEditSubmit = async (
  page: PortalPage,
): Promise<{ ok: true; via: string } | { ok: false; error: string }> => {
  const arg: ClickArg = {
    editFormId: PORTAL_STATUS_SELECTORS.editFormId,
    editFormActionSubstring: PORTAL_STATUS_SELECTORS.editFormActionSubstring,
    submitButtonText: PORTAL_STATUS_SELECTORS.editSubmitButtonText,
  };

  try {
    await page.waitForFunction(
      (a: ClickArg) => {
        const collapse = (text: string): string =>
          text.replace(/\s+/g, ' ').trim().toLowerCase();
        const needle = collapse(a.submitButtonText);
        const form =
          (document.getElementById(a.editFormId) as HTMLFormElement | null) ??
          (Array.from(document.querySelectorAll('form')).find((f) =>
            (f.getAttribute('action') ?? '').includes(a.editFormActionSubstring),
          ) as HTMLFormElement | undefined);
        if (!form) return false;
        const btn = Array.from(
          form.querySelectorAll(
            'button[type="submit"], input[type="submit"], button.btn-primary',
          ),
        ).find((el) => {
          const label =
            el instanceof HTMLInputElement
              ? el.value
              : (el.textContent ?? '');
          return collapse(label) === needle;
        }) as HTMLButtonElement | HTMLInputElement | undefined;
        if (!btn) return false;
        if ('disabled' in btn && btn.disabled) return false;
        return true;
      },
      arg,
      { timeout: PORTAL_NAV_TIMEOUT_MS },
    );
  } catch {
    return {
      ok: false,
      error: `Edit Submit not ready within ${PORTAL_NAV_TIMEOUT_MS}ms`,
    };
  }

  const clicked = await page.evaluate((a: ClickArg) => {
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim().toLowerCase();
    const needle = collapse(a.submitButtonText);
    const form =
      (document.getElementById(a.editFormId) as HTMLFormElement | null) ??
      (Array.from(document.querySelectorAll('form')).find((f) =>
        (f.getAttribute('action') ?? '').includes(a.editFormActionSubstring),
      ) as HTMLFormElement | undefined);
    if (!form) {
      return { ok: false as const, via: 'form-missing' };
    }
    const btn = Array.from(
      form.querySelectorAll(
        'button[type="submit"], input[type="submit"], button.btn-primary',
      ),
    ).find((el) => {
      const label =
        el instanceof HTMLInputElement ? el.value : (el.textContent ?? '');
      return collapse(label) === needle;
    }) as HTMLButtonElement | HTMLInputElement | undefined;
    if (!btn || ('disabled' in btn && btn.disabled)) {
      return { ok: false as const, via: 'not-ready' };
    }
    btn.click();
    return { ok: true as const, via: a.submitButtonText };
  }, arg);

  if (!clicked.ok) {
    return { ok: false, error: `Edit Submit click failed (${clicked.via})` };
  }
  return { ok: true, via: clicked.via };
};
