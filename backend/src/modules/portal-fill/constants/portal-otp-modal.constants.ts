/**
 * OTP Ok confirmation modal dismiss cascade (DEC-002 / REQ-006 / REQ-015).
 *
 * Live capture (operator 2026-09-17): `#commonModal` with footer
 * `button.btn-success` labeled "Ok" (`data-bs-dismiss="modal"`).
 *
 * Cascade order at runtime:
 * 1. PORTAL_OTP_OK_PREFERRED_SELECTORS
 * 2. Visible button inside modal roots whose normalized text is Ok / OK
 * 3. Fail clearly if none match within PORTAL_OTP_OK_MODAL_MS
 *
 * No named helper functions in this module.
 */

/** Preferred Ok control CSS selectors (live `#commonModal` evidence). */
export const PORTAL_OTP_OK_PREFERRED_SELECTORS: readonly string[] = [
  '#commonModal .modal-footer button.btn-success',
  '#commonModal button.btn-success[data-bs-dismiss="modal"]',
];

/** Visible modal/dialog roots to search for Ok (Bootstrap-style + a11y). */
export const PORTAL_OTP_OK_MODAL_ROOT_SELECTORS: readonly string[] = [
  '#commonModal.modal.show',
  '#commonModal',
  '.modal.show',
  '[role="dialog"]',
];

/** Accepted Ok button labels (normalized trim compare). */
export const PORTAL_OTP_OK_BUTTON_TEXTS: readonly string[] = ['Ok', 'OK'];
