/**
 * Credential ensure before captcha ensure/solve (portal-captcha-credential-refill).
 * A field is **supplied** only when it is a non-empty string after trim of the
 * credential value itself (DEC-002). Omitted / empty → that kind is skipped.
 */

export type EnsurePortalLoginCredentialsForCaptchaOptions = {
  /**
   * Login form email. Supplied only when non-empty after trim (DEC-002).
   * Never log the full value when masked patterns are not used.
   */
  portalFormEmail?: string;
  /**
   * Vaulted login password. Supplied only when non-empty after trim (DEC-002).
   * Must never be logged (REQ-008).
   */
  portalPassword?: string;
};

export type EnsurePortalLoginCredentialFieldOutcome = {
  ok: boolean;
  /** Non-secret failure reason when `ok` is false. */
  reason?: string;
  /** How the field was ensured when `ok` is true. */
  via?: 'already_non_empty' | 'refilled';
};

export type EnsurePortalLoginCredentialsForCaptchaResult = {
  ok: boolean;
  /** Aggregate non-secret failure reason (first failing field). */
  reason?: string;
  emailOutcome?: EnsurePortalLoginCredentialFieldOutcome;
  passwordOutcome?: EnsurePortalLoginCredentialFieldOutcome;
};
