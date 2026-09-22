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
