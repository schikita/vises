import { PORTAL_PASSWORD_CHANGE_SELECTORS } from '../constants';
import type { PortalPage, WidgetOpResult } from '../types';

type FillArg = {
  formActionSubstring: string;
  currentPasswordName: string;
  newPasswordName: string;
  confirmPasswordName: string;
  currentPassword: string;
  newPassword: string;
};

/**
 * Fill Current / New / Confirm password on forced-change form.
 * Never logs password values.
 */
export const fillPortalPasswordChangeForm = async (
  page: PortalPage,
  input: { currentPassword: string; newPassword: string },
): Promise<WidgetOpResult> => {
  const arg: FillArg = {
    formActionSubstring: PORTAL_PASSWORD_CHANGE_SELECTORS.formActionSubstring,
    currentPasswordName: PORTAL_PASSWORD_CHANGE_SELECTORS.currentPasswordName,
    newPasswordName: PORTAL_PASSWORD_CHANGE_SELECTORS.newPasswordName,
    confirmPasswordName: PORTAL_PASSWORD_CHANGE_SELECTORS.confirmPasswordName,
    currentPassword: input.currentPassword,
    newPassword: input.newPassword,
  };

  const filled = await page.evaluate((a: FillArg) => {
    const forms = Array.from(document.querySelectorAll('form'));
    const changeForm = forms.find((f) =>
      (f.getAttribute('action') ?? '').includes(a.formActionSubstring),
    );
    if (!changeForm) {
      return { ok: false as const, reason: 'change password form not found' };
    }

    const current = changeForm.querySelector(
      `input[name="${a.currentPasswordName}"]`,
    ) as HTMLInputElement | null;
    const next = changeForm.querySelector(
      `input[name="${a.newPasswordName}"]`,
    ) as HTMLInputElement | null;
    const confirm = changeForm.querySelector(
      `input[name="${a.confirmPasswordName}"]`,
    ) as HTMLInputElement | null;

    if (!current || !next || !confirm) {
      return {
        ok: false as const,
        reason: 'change password inputs missing',
      };
    }

    current.focus();
    current.value = a.currentPassword;
    current.dispatchEvent(new Event('input', { bubbles: true }));
    current.dispatchEvent(new Event('change', { bubbles: true }));

    next.focus();
    next.value = a.newPassword;
    next.dispatchEvent(new Event('input', { bubbles: true }));
    next.dispatchEvent(new Event('change', { bubbles: true }));

    confirm.focus();
    confirm.value = a.newPassword;
    confirm.dispatchEvent(new Event('input', { bubbles: true }));
    confirm.dispatchEvent(new Event('change', { bubbles: true }));

    const match =
      current.value === a.currentPassword &&
      next.value === a.newPassword &&
      confirm.value === a.newPassword;

    return match
      ? { ok: true as const, via: 'evaluate-fill' }
      : {
          ok: false as const,
          reason: 'change password read-back mismatch',
        };
  }, arg);

  if (!filled.ok) {
    return { ok: false, reason: filled.reason };
  }

  return { ok: true, via: filled.via, value: undefined };
};
