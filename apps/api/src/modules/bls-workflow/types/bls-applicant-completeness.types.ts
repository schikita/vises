/** Stable rule ids for Start Completeness required/format checks (DEC-001, APF REQ-008). */
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
  | 'address_missing'
  | 'home_country_missing'
  | 'home_city_missing'
  | 'home_postal_code_missing'
  | 'purpose_missing'
  | 'first_entry_missing'
  | 'entries_missing'
  | 'duration_days_missing'
  | 'employer_name_missing'
  | 'employer_phone_missing'
  | 'employer_address_missing'
  | 'occupation_missing'
  | 'bls_inviting_authority_missing'
  | 'inviting_authority_name_missing'
  | 'inviting_country_missing'
  | 'inviting_city_missing'
  | 'inviting_zip_code_missing'
  | 'inviting_address_missing'
  | 'inviting_email_missing'
  | 'inviting_contact_no_missing'
  | 'inviting_contact_name_missing'
  | 'inviting_contact_surname_missing'
  | 'inviting_contact_country_missing'
  | 'inviting_contact_city_missing'
  | 'inviting_contact_zip_code_missing'
  | 'inviting_contact_address_missing'
  | 'inviting_contact_contact_no_missing'
  | 'inviting_contact_email_missing'
  | 'cost_covered_by_missing'
  | 'means_of_support_missing'
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
  address?: string | null;
  homeCountry?: string | null;
  homeCity?: string | null;
  homePostalCode?: string | null;
  purpose?: string | null;
  firstEntry?: string | null;
  entries?: string | null;
  durationDays?: string | null;
  employerName?: string | null;
  employerPhone?: string | null;
  employerAddress?: string | null;
  occupation?: string | null;
  blsInvitingAuthority?: string | null;
  invitingAuthorityName?: string | null;
  invitingCountry?: string | null;
  invitingCity?: string | null;
  invitingZipCode?: string | null;
  invitingAddress?: string | null;
  invitingEmail?: string | null;
  invitingContactNo?: string | null;
  invitingContactName?: string | null;
  invitingContactSurname?: string | null;
  invitingContactCountry?: string | null;
  invitingContactCity?: string | null;
  invitingContactZipCode?: string | null;
  invitingContactAddress?: string | null;
  invitingContactContactNo?: string | null;
  invitingContactEmail?: string | null;
  costCoveredBy?: string | null;
  meansOfSupport?: string | null;
};

/** Input for per-applicant Completeness validation. */
export type ValidateBlsApplicantCompletenessInput = {
  applicant: BlsApplicantCompletenessFields;
};
