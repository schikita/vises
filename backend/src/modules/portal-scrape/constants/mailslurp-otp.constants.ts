/**
 * MailSlurp OTP UI timeouts for portal RegisterUser (DEC-010).
 * Vendor wait/extract patterns live in modules/mailslurp (DEC-001).
 * No named helper functions in this module.
 */

/** Bounded wait until `#btnGenerate` is ready (DEC-010). */
export const PORTAL_OTP_GENERATE_READY_MS = 30_000;

/** Bounded wait for OTP Ok confirmation modal (DEC-010). */
export const PORTAL_OTP_OK_MODAL_MS = 15_000;
