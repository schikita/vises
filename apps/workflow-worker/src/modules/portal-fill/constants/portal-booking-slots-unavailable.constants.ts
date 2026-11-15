/**
 * BOOK slots-unavailable branch (REQ-014…015 / NFR-001 / DEC-008 / VT-TASK-009).
 * Named constants only — no helper functions.
 */

/** SAFE_TO_REPEAT failure code when slots banner seen (runner backoff + maxAttempts). */
export const PORTAL_BOOKING_SLOTS_UNAVAILABLE_ERROR_CODE =
  'bls_booking_slots_unavailable';

/**
 * Post-captcha window to probe for slots-unavailable banner text
 * (`slots-not-available.html` / REQ-014). Absence is not a failure.
 */
export const PORTAL_BOOKING_SLOTS_PROBE_MS = 10_000;
