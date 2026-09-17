/**
 * OTP Ok-modal dismiss shapes (DEC-002). Used by page.evaluate helpers.
 */

export type PortalOtpOkModalActionArg = {
  /** Preferred id/onclick selectors from live evidence; may be empty (DEC-002). */
  preferredSelectors: readonly string[];
  /** Modal root candidates (visible dialog / Bootstrap show). */
  modalRootSelectors: readonly string[];
  /** Normalized button labels accepted as Ok. */
  okButtonTexts: readonly string[];
};

export type PortalOtpOkModalActionResult =
  | { ok: true; via: string }
  | { ok: false; error: string };
