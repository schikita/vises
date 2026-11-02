/** Civil calendar `{year, month, day}` (month 1–12) for date-only math (DEC-007). */
export type DateOnlyParts = {
  year: number;
  month: number;
  day: number;
};

/** Result of strict `YYYY-MM-DD` parse (REQ-004 / CON-003). */
export type ParseDateOnlyResult =
  | { status: 'missing' }
  | { status: 'unparseable' }
  | { status: 'ok'; ymd: string; parts: DateOnlyParts };

/** Stable rule ids for Core + Extended applicant date checks. */
export type BlsApplicantDateRuleId =
  | 'dob_missing'
  | 'dob_unparseable'
  | 'dob_not_before_today'
  | 'passport_issued_missing'
  | 'passport_issued_unparseable'
  | 'passport_issued_future'
  | 'passport_expires_missing'
  | 'passport_expires_unparseable'
  | 'passport_expires_lt_180_days'
  | 'passport_issued_after_expires'
  | 'passport_issued_before_dob'
  | 'passport_expires_lt_return_plus_3m'
  | 'passport_issued_older_than_10y';

/** One failed Core/Extended rule for a participating applicant. */
export type BlsApplicantDateViolation = {
  ruleId: BlsApplicantDateRuleId;
  applicantId: string;
  applicantLabel: string;
  message: string;
};

/** Date fields read from a workflow-participating applicant row. */
export type BlsApplicantDateFields = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  dob?: string | null;
  passportIssued?: string | null;
  passportExpires?: string | null;
};

/** Input for per-applicant Core + Extended validation. */
export type ValidateBlsApplicantDatesInput = {
  applicant: BlsApplicantDateFields;
  /** UTC reference calendar day `YYYY-MM-DD` (DEC-004). */
  referenceDateYmd: string;
  /**
   * Application `returnDate` raw string.
   * e3 runs only when this parses; otherwise e3 is skipped (DEC-002).
   */
  returnDateRaw: string;
};
