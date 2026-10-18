/**
 * Forced/expired password-change cues aligned with fixture `reset_password.html`
 * (REQ-012 / REQ-013 / TASK-010). Named constants only — no helper functions.
 */

export const PORTAL_PASSWORD_CHANGE_SELECTORS = {
  /** Form `action` substring (`/Global/account/ChangeUserPassword`). */
  formActionSubstring: 'ChangeUserPassword',
  currentPasswordName: 'CurrentPassword',
  newPasswordName: 'NewPassword',
  confirmPasswordName: 'ConfirmPassword',
  /** Hidden field present on forced-change form. */
  changePasswordAlertName: 'ChangePasswordAlert',
  /** Heading text cue. */
  headingText: 'Change Password',
  /** Danger alert substring (fixture: "Your password has been expired…"). */
  expiredAlertCue: 'password has been expired',
  /** Submit button visible text. */
  submitButtonText: 'Update Password',
} as const;

/** Wait for change form to clear after submit. */
export const PORTAL_PASSWORD_CHANGE_VERIFY_WAIT_MS = 30_000;

/** Poll interval while waiting for change-form absence. */
export const PORTAL_PASSWORD_CHANGE_POLL_MS = 500;

/**
 * Best-effort `domcontentloaded` settle after successful Update Password click
 * (DEC-004). Named budget only — not a bare sleep.
 */
export const PORTAL_PASSWORD_CHANGE_POST_SUBMIT_SETTLE_MS = 5_000;
