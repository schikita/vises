/**
 * Static CSS / contract selectors for portal login Email/Password path (DEC-010).
 * Randomized Email/Password input ids/names are discovered at runtime — not listed here.
 */
export type PortalLoginSelectors = {
  /** Primary verify/submit control on login / login-captcha samples. */
  verifyControl: string;
  /** Substring match on email-step form `action` (e.g. LoginSubmit). */
  formActionSubstring: string;
  /** Substring match on password+captcha form `action` (LoginCaptchaSubmit). */
  captchaFormActionSubstring: string;
  /** Visible label text for Email controls (English portal copy). */
  emailLabelText: string;
  /** Visible label text for Password controls among decoys. */
  passwordLabelText: string;
  /** Class often left on decoy / locked entry fields. */
  entryDisabledClass: string;
  hidden: {
    responseData: string;
    returnUrl: string;
    id: string;
    requestVerificationToken: string;
  };
};
