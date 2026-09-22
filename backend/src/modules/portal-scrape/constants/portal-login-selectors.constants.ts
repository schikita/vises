import type { PortalLoginSelectors } from '../types';

/**
 * Login form contract selectors (`login.html` / `login_captcha.html` / live BLS).
 * Do not hardcode randomized Email/Password input ids (DEC-010 / REQ-010 / REQ-011).
 * Hidden field selectors are reference-only — never strip tokens during fill.
 */
export const PORTAL_LOGIN_SELECTORS: PortalLoginSelectors = {
  verifyControl: '#btnVerify',
  formActionSubstring: 'LoginSubmit',
  captchaFormActionSubstring: 'LoginCaptchaSubmit',
  emailLabelText: 'Email',
  passwordLabelText: 'Password',
  entryDisabledClass: 'entry-disabled',
  hidden: {
    responseData: '#ResponseData',
    returnUrl: '#ReturnUrl',
    id: '#Id',
    requestVerificationToken: 'input[name="__RequestVerificationToken"]',
  },
};
