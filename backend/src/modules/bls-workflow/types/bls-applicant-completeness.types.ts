/** Stable rule ids for Start Completeness required/format checks (DEC-001). */
export type BlsApplicantCompletenessRuleId =
  | 'first_name_missing'
  | 'last_name_missing'
  | 'last_name_at_birth_missing'
  | 'dob_missing'
  | 'country_of_birth_missing'
  | 'passport_number_missing'
  | 'passport_issued_missing'
  | 'passport_expires_missing'
  | 'passport_type_missing'
  | 'passport_issue_country_missing'
  | 'passport_issued_by_missing'
  | 'phone_missing'
  | 'phone_invalid_digits'
  | 'client_email_missing';

/**
 * One failed Completeness rule.
 * Application-level `client_email_missing` uses empty `applicantId` / `applicantLabel`.
 */
export type BlsApplicantCompletenessViolation = {
  ruleId: BlsApplicantCompletenessRuleId;
  applicantId: string;
  applicantLabel: string;
  message: string;
};

/** Completeness fields read from a workflow-participating applicant row. */
export type BlsApplicantCompletenessFields = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  lastNameAtBirth?: string | null;
  dob?: string | null;
  countryOfBirth?: string | null;
  passportNumber?: string | null;
  passportIssued?: string | null;
  passportExpires?: string | null;
  passportType?: string | null;
  passportIssueCountry?: string | null;
  passportIssuedBy?: string | null;
  phone?: string | null;
};

/** Input for per-applicant Completeness validation. */
export type ValidateBlsApplicantCompletenessInput = {
  applicant: BlsApplicantCompletenessFields;
};
