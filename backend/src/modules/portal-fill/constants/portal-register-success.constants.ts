/**
 * RegisterUser success-page cues aligned with fixture `succes.html`
 * (on-disk spelling) — REQ-009 / DEC-019.
 * Named constants only — no helper functions.
 */

export const PORTAL_REGISTER_SUCCESS_SELECTORS = {
  root: '#div-success',
  status: '#status',
  message: '#message',
  continueButton: '#contBtn',
} as const;

/** Expected `#status` text (fixture: "Success"). */
export const PORTAL_REGISTER_SUCCESS_STATUS_TEXT = 'Success';

/**
 * Substring of `#message` confirming account creation
 * (fixture: "Congratulations, your account has been successfully created…").
 */
export const PORTAL_REGISTER_SUCCESS_MESSAGE_CUE = 'successfully created';

/** Wait for success root after `#btnSubmit` (nav / AJAX settle). */
export const PORTAL_REGISTER_SUCCESS_WAIT_MS = 30_000;

/**
 * Fixed settle after `#btnSubmit` before visibility-oriented success verify
 * (REQ-005 / DEC-005).
 */
export const PORTAL_REGISTER_SUBMIT_SETTLE_MS = 3_000;

/** Poll interval while waiting for visible `#div-success` cues. */
export const PORTAL_REGISTER_SUCCESS_POLL_MS = 250;
