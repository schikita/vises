import {
  PORTAL_NAV_TIMEOUT_MS,
  PORTAL_STATUS_POLL_MS,
  PORTAL_STATUS_SELECTORS,
} from '../constants';
import type { PortalDomContext } from '../types/portal-dom-context.types';

type ClickArg = {
  editFormId: string;
  editFormActionSubstring: string;
  submitButtonText: string;
};

const isSubmitReady = async (
  context: PortalDomContext,
  arg: ClickArg,
): Promise<boolean> =>
  context.evaluate((a: ClickArg) => {
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
        el instanceof HTMLInputElement ? el.value : (el.textContent ?? '');
      return collapse(label) === needle;
    }) as HTMLButtonElement | HTMLInputElement | undefined;
    if (!btn) return false;
    if ('disabled' in btn && btn.disabled) return false;
    return true;
  }, arg);

/**
 * Click Submit on the Edit Member / ManageApplicant form (`edit_app.html`).
 * Operate in Edit Member iframe context after Proceed (REQ-005).
 */
export const clickPortalApplicantEditSubmit = async (
  context: PortalDomContext,
): Promise<{ ok: true; via: string } | { ok: false; error: string }> => {
  const arg: ClickArg = {
    editFormId: PORTAL_STATUS_SELECTORS.editFormId,
    editFormActionSubstring: PORTAL_STATUS_SELECTORS.editFormActionSubstring,
    submitButtonText: PORTAL_STATUS_SELECTORS.editSubmitButtonText,
  };

  const deadline = Date.now() + PORTAL_NAV_TIMEOUT_MS;
  let ready = false;
  while (Date.now() < deadline) {
    ready = await isSubmitReady(context, arg);
    if (ready) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, PORTAL_STATUS_POLL_MS));
  }

  if (!ready) {
    return {
      ok: false,
      error: `Edit Submit not ready within ${PORTAL_NAV_TIMEOUT_MS}ms`,
    };
  }

  const clicked = await context.evaluate((a: ClickArg) => {
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
