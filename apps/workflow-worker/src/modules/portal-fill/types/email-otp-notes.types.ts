/**
 * Inputs for disposable email OTP autofill report notes (REQ-011 / NFR-001).
 * Never pass tokens, passwords, email bodies, or raw OTP into notes builders.
 */

export type BuildEmailOtpNotesInput = {
  /**
   * Captcha service key ∧ product enable; tempmail_plus only
   * (DEC-004 / DEC-007).
   */
  otpPathArmed: boolean;
  /** True when `#Email` was filled from a temporary mailbox this run (post-captcha). */
  emailFromTemporaryMailbox: boolean;
  emailOtpTouched: boolean;
  /** OTP UI phase started after captcha success. */
  emailOtpAttempted?: boolean;
  /** OTP wait/extract/fill completed successfully. */
  emailOtpOk?: boolean;
  /**
   * `#btnReGenerate` clicks performed this run (0|1 per DEC-008).
   * Omit when OTP phase never started.
   */
  resendAttempts?: number;
  /**
   * True when mail-provider CB refused a protected call or opened during the run
   * (REQ-011 / REQ-015). Omit when not observed.
   */
  mailProviderCircuitOpen?: boolean;
  /** Best-effort temporary-mailbox account delete succeeded (REQ-010). */
  accountDeleted?: boolean;
  /** Soft-fail delete detail (no token/password). */
  accountDeleteWarn?: string;
  /**
   * True when mailbox was retained after OTP success (REQ-016 / DEC-007).
   * Mutually exclusive with a successful delete on the same run.
   */
  accountRetained?: boolean;
  /** Fill/pipeline error when OTP phase failed (safe message only). */
  error?: string;
};
