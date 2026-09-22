import { PORTAL_PASSWORD_CHANGE_SELECTORS } from '../constants';
import type { PortalPage } from '../types';

type ProbeArg = {
  formActionSubstring: string;
  currentPasswordName: string;
  newPasswordName: string;
  confirmPasswordName: string;
  changePasswordAlertName: string;
  headingText: string;
  expiredAlertCue: string;
};

/**
 * True when the page shows forced/expired password-change UI
 * (fixture `reset_password.html` cues).
 */
export const isPortalPasswordChangeFormVisible = async (
  page: PortalPage,
): Promise<boolean> => {
  const arg: ProbeArg = {
    formActionSubstring: PORTAL_PASSWORD_CHANGE_SELECTORS.formActionSubstring,
    currentPasswordName: PORTAL_PASSWORD_CHANGE_SELECTORS.currentPasswordName,
    newPasswordName: PORTAL_PASSWORD_CHANGE_SELECTORS.newPasswordName,
    confirmPasswordName: PORTAL_PASSWORD_CHANGE_SELECTORS.confirmPasswordName,
    changePasswordAlertName:
      PORTAL_PASSWORD_CHANGE_SELECTORS.changePasswordAlertName,
    headingText: PORTAL_PASSWORD_CHANGE_SELECTORS.headingText,
    expiredAlertCue: PORTAL_PASSWORD_CHANGE_SELECTORS.expiredAlertCue,
  };

  return page.evaluate((a: ProbeArg) => {
    const normalize = (text: string): string =>
      text.replace(/\s+/g, ' ').trim().toLowerCase();

    const forms = Array.from(document.querySelectorAll('form'));
    const changeForm = forms.find((f) =>
      (f.getAttribute('action') ?? '').includes(a.formActionSubstring),
    );
    if (!changeForm) {
      return false;
    }

    const current = changeForm.querySelector(
      `input[name="${a.currentPasswordName}"]`,
    );
    const next = changeForm.querySelector(
      `input[name="${a.newPasswordName}"]`,
    );
    const confirm = changeForm.querySelector(
      `input[name="${a.confirmPasswordName}"]`,
    );
    if (!current || !next || !confirm) {
      return false;
    }

    const alertField = changeForm.querySelector(
      `input[name="${a.changePasswordAlertName}"]`,
    );
    if (alertField) {
      return true;
    }

    const headingNeedle = normalize(a.headingText);
    const headings = Array.from(
      document.querySelectorAll('h1, h2, h3, h4, h5, h6'),
    );
    const hasHeading = headings.some(
      (h) => normalize(h.textContent ?? '') === headingNeedle,
    );
    if (hasHeading) {
      return true;
    }

    const expiredNeedle = normalize(a.expiredAlertCue);
    const alerts = Array.from(
      document.querySelectorAll('.alert, .alert-danger'),
    );
    return alerts.some((el) =>
      normalize(el.textContent ?? '').includes(expiredNeedle),
    );
  }, arg);
};
