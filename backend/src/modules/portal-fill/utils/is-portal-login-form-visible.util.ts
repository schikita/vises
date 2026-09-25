import { PORTAL_LOGIN_SELECTORS } from '../constants';
import type { PortalPage } from '../types';

type ProbeArg = {
  formActionSubstring: string;
  captchaFormActionSubstring: string;
  emailLabelText: string;
  passwordLabelText: string;
  verifyControl: string;
};

/**
 * True when the page still shows login email or password/captcha UI
 * (fixtures `login.html` / `login_captcha.html`).
 */
export const isPortalLoginFormVisible = async (
  page: PortalPage,
): Promise<boolean> => {
  const arg: ProbeArg = {
    formActionSubstring: PORTAL_LOGIN_SELECTORS.formActionSubstring,
    captchaFormActionSubstring:
      PORTAL_LOGIN_SELECTORS.captchaFormActionSubstring,
    emailLabelText: PORTAL_LOGIN_SELECTORS.emailLabelText,
    passwordLabelText: PORTAL_LOGIN_SELECTORS.passwordLabelText,
    verifyControl: PORTAL_LOGIN_SELECTORS.verifyControl,
  };

  return page.evaluate((a: ProbeArg) => {
    const normalizeLabel = (text: string): string =>
      text.replace(/\s+/g, ' ').replace(/\*/g, '').trim().toLowerCase();

    const emailNeedle = normalizeLabel(a.emailLabelText);
    const passwordNeedle = normalizeLabel(a.passwordLabelText);

    const forms = Array.from(document.querySelectorAll('form'));
    const loginSubmit = forms.find((f) =>
      (f.getAttribute('action') ?? '').includes(a.formActionSubstring),
    );
    if (loginSubmit) {
      const labels = Array.from(loginSubmit.querySelectorAll('label'));
      const hasEmail = labels.some(
        (lab) => normalizeLabel(lab.textContent ?? '') === emailNeedle,
      );
      if (hasEmail) {
        return true;
      }
    }

    const captchaSubmit = forms.find((f) =>
      (f.getAttribute('action') ?? '').includes(a.captchaFormActionSubstring),
    );
    if (captchaSubmit) {
      return true;
    }

    const passwordInputs = Array.from(
      document.querySelectorAll('input[type="password"]'),
    ) as HTMLInputElement[];
    const hasPasswordLabel = passwordInputs.some((input) => {
      const id = input.id?.trim();
      if (id) {
        const lab = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (lab && normalizeLabel(lab.textContent ?? '') === passwordNeedle) {
          return true;
        }
      }
      const wrap = input.closest('div');
      const nearby = wrap?.querySelector('label');
      return (
        nearby != null &&
        normalizeLabel(nearby.textContent ?? '') === passwordNeedle
      );
    });
    if (hasPasswordLabel) {
      return true;
    }

    const verify = document.querySelector(a.verifyControl);
    if (verify && loginSubmit) {
      return true;
    }

    return false;
  }, arg);
};
