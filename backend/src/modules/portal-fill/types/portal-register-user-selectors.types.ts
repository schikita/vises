import type { PortalFieldName } from '../../portal-core/types/portal-field.types';

/**
 * Static CSS selectors for RegisterUser form controls (DEC-001).
 * Environment variables MUST NOT encode these strings (REQ-001).
 * OTP controls: portal-email-otp-mailtm (REQ-005 / DEC-005).
 */
export type PortalRegisterUserSelectors = {
  formRoot: string;
  verifyControl: string;
  /** Portal captcha Verified control (REQ-001 / DEC-006). */
  verifiedControl: string;
  /** Request email OTP (REQ-005). */
  generateControl: string;
  /**
   * Registration submit — clicked only when `submitRegisterForm` is opted in
   * (REQ-009 / DEC-019). Legacy autofill leaves this unclicked.
   */
  submitControl: string;
  /** Resend OTP — not clicked on happy path (REQ-010 / DEC-006). */
  regenerateControl: string;
  fields: Readonly<Record<PortalFieldName, string>>;
};
