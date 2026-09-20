/**
 * Portal RegisterUser email-OTP UI timeouts (REQ-006 / DEC-007).
 * Vendor wait/extract patterns live in modules/mailtm (DEC-003).
 * No named helper functions in this module.
 */

/** Bounded wait until `#btnGenerate` / `#btnReGenerate` is ready (REQ-006). */
export const PORTAL_OTP_GENERATE_READY_MS = 30_000;

/** Bounded wait for OTP Ok confirmation modal (REQ-006). */
export const PORTAL_OTP_OK_MODAL_MS = 15_000;

/**
 * Max `#btnReGenerate` clicks after first wait/extract miss (REQ-014 / DEC-008).
 * Each wait attempt still uses a fresh MAILTM_WAIT_FOR_EMAIL_MS budget (DEC-007).
 */
export const PORTAL_OTP_RESEND_MAX_ATTEMPTS = 1;
