/**
 * Inputs for MailSlurp / Email OTP autofill report notes (REQ-011 / NFR-004).
 * Never pass API keys, email bodies, or raw OTP into notes builders.
 */

export type BuildMailSlurpOtpNotesInput = {
  /** DEC-001: both CapMonster + MailSlurp keys present for this run. */
  otpPathArmed: boolean;
  /** True when mapper Email came from MailSlurp inbox override. */
  emailFromMailSlurp: boolean;
  emailOtpTouched: boolean;
  /** OTP UI phase started after CapMonster success. */
  mailSlurpOtpAttempted?: boolean;
  /** OTP wait/extract/fill completed successfully. */
  mailSlurpOtpOk?: boolean;
  /** Best-effort delete ran and succeeded (DEC-005). */
  inboxDeleted?: boolean;
  /** Soft-fail delete detail (no API key). */
  inboxDeleteWarn?: string;
  /** Fill/pipeline error when OTP phase failed (safe message only). */
  error?: string;
};
