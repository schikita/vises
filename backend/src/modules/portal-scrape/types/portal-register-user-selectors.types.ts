import type { PortalFieldName } from './portal-field.types';

/**
 * Static CSS selectors for RegisterUser form controls (DEC-001).
 * Environment variables MUST NOT encode these strings (REQ-001).
 * OTP controls: REQ-015 / portal-email-otp-mailslurp.
 */
export type PortalRegisterUserSelectors = {
  formRoot: string;
  verifyControl: string;
  /** Request email OTP (REQ-005). */
  generateControl: string;
  /** Registration submit — prepared but commented out at call site (REQ-009). */
  submitControl: string;
  /** Resend OTP — not clicked on happy path (REQ-010 / DEC-006). */
  regenerateControl: string;
  fields: Readonly<Record<PortalFieldName, string>>;
};
