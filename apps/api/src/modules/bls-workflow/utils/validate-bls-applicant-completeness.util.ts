import {
  BLS_APPLICANT_COMPLETENESS_MSG_ADDRESS_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_BLS_INVITING_AUTHORITY_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_COST_COVERED_BY_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_COUNTRY_OF_BIRTH_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_DOB_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_DURATION_DAYS_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_EMPLOYER_ADDRESS_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_EMPLOYER_NAME_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_EMPLOYER_PHONE_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_ENTRIES_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_FIRST_ENTRY_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_FIRST_NAME_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_HOME_CITY_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_HOME_COUNTRY_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_HOME_POSTAL_CODE_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_ADDRESS_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_AUTHORITY_NAME_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CITY_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_ADDRESS_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_CITY_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_CONTACT_NO_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_COUNTRY_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_EMAIL_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_NAME_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_NO_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_SURNAME_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_ZIP_CODE_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_COUNTRY_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_EMAIL_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_INVITING_ZIP_CODE_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_LAST_NAME_AT_BIRTH_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_LAST_NAME_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_MEANS_OF_SUPPORT_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_OCCUPATION_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_EXPIRES_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_ISSUE_COUNTRY_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_ISSUED_BY_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_ISSUED_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_NUMBER_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_TYPE_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PHONE_INVALID_DIGITS,
  BLS_APPLICANT_COMPLETENESS_MSG_PHONE_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PURPOSE_MISSING,
  BLS_APPLICANT_COMPLETENESS_PHONE_DIGITS_LENGTH,
} from '../constants/bls-applicant-completeness.constants';
import type {
  BlsApplicantCompletenessViolation,
  ValidateBlsApplicantCompletenessInput,
} from '../types/bls-applicant-completeness.types';
import { digitsOnly } from '../../portal-core/utils/digits-only.util';
import { buildBlsApplicantDateIdentityLabel } from './build-bls-applicant-date-identity-label.util';

/**
 * Start Completeness required/format checks for one applicant (DEC-001, DEC-006, APF REQ-008).
 * Aggregates every failed Completeness rule; does not run Core/Extended date math.
 * Inviting company auth+contact keys are always required (happy-path start-gate simplicity).
 */
export const validateBlsApplicantCompleteness = (
  input: ValidateBlsApplicantCompletenessInput,
): BlsApplicantCompletenessViolation[] => {
  const { applicant } = input;
  const applicantId = String(applicant.id).trim();
  const applicantLabel = buildBlsApplicantDateIdentityLabel(applicant);
  const violations: BlsApplicantCompletenessViolation[] = [];

  const push = (
    ruleId: BlsApplicantCompletenessViolation['ruleId'],
    message: string,
  ): void => {
    violations.push({ ruleId, applicantId, applicantLabel, message });
  };

  const isMissing = (raw: string | null | undefined): boolean =>
    String(raw ?? '').trim().length === 0;

  if (isMissing(applicant.firstName)) {
    push('first_name_missing', BLS_APPLICANT_COMPLETENESS_MSG_FIRST_NAME_MISSING);
  }
  if (isMissing(applicant.lastName)) {
    push('last_name_missing', BLS_APPLICANT_COMPLETENESS_MSG_LAST_NAME_MISSING);
  }
  if (isMissing(applicant.lastNameAtBirth)) {
    push(
      'last_name_at_birth_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_LAST_NAME_AT_BIRTH_MISSING,
    );
  }
  if (isMissing(applicant.dob)) {
    push('dob_missing', BLS_APPLICANT_COMPLETENESS_MSG_DOB_MISSING);
  }
  if (isMissing(applicant.countryOfBirth)) {
    push(
      'country_of_birth_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_COUNTRY_OF_BIRTH_MISSING,
    );
  }
  if (isMissing(applicant.passportNumber)) {
    push(
      'passport_number_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_NUMBER_MISSING,
    );
  }
  if (isMissing(applicant.passportIssued)) {
    push(
      'passport_issued_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_ISSUED_MISSING,
    );
  }
  if (isMissing(applicant.passportExpires)) {
    push(
      'passport_expires_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_EXPIRES_MISSING,
    );
  }
  if (isMissing(applicant.passportType)) {
    push(
      'passport_type_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_TYPE_MISSING,
    );
  }
  if (isMissing(applicant.passportIssueCountry)) {
    push(
      'passport_issue_country_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_ISSUE_COUNTRY_MISSING,
    );
  }
  if (isMissing(applicant.passportIssuedBy)) {
    push(
      'passport_issued_by_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_ISSUED_BY_MISSING,
    );
  }

  if (isMissing(applicant.phone)) {
    push('phone_missing', BLS_APPLICANT_COMPLETENESS_MSG_PHONE_MISSING);
  } else if (
    digitsOnly(String(applicant.phone)).length !==
    BLS_APPLICANT_COMPLETENESS_PHONE_DIGITS_LENGTH
  ) {
    push(
      'phone_invalid_digits',
      BLS_APPLICANT_COMPLETENESS_MSG_PHONE_INVALID_DIGITS,
    );
  }

  if (isMissing(applicant.address)) {
    push('address_missing', BLS_APPLICANT_COMPLETENESS_MSG_ADDRESS_MISSING);
  }
  if (isMissing(applicant.homeCountry)) {
    push(
      'home_country_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_HOME_COUNTRY_MISSING,
    );
  }
  if (isMissing(applicant.homeCity)) {
    push('home_city_missing', BLS_APPLICANT_COMPLETENESS_MSG_HOME_CITY_MISSING);
  }
  if (isMissing(applicant.homePostalCode)) {
    push(
      'home_postal_code_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_HOME_POSTAL_CODE_MISSING,
    );
  }
  if (isMissing(applicant.purpose)) {
    push('purpose_missing', BLS_APPLICANT_COMPLETENESS_MSG_PURPOSE_MISSING);
  }
  if (isMissing(applicant.firstEntry)) {
    push(
      'first_entry_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_FIRST_ENTRY_MISSING,
    );
  }
  if (isMissing(applicant.entries)) {
    push('entries_missing', BLS_APPLICANT_COMPLETENESS_MSG_ENTRIES_MISSING);
  }
  if (isMissing(applicant.durationDays)) {
    push(
      'duration_days_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_DURATION_DAYS_MISSING,
    );
  }
  if (isMissing(applicant.employerName)) {
    push(
      'employer_name_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_EMPLOYER_NAME_MISSING,
    );
  }
  if (isMissing(applicant.employerPhone)) {
    push(
      'employer_phone_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_EMPLOYER_PHONE_MISSING,
    );
  }
  if (isMissing(applicant.employerAddress)) {
    push(
      'employer_address_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_EMPLOYER_ADDRESS_MISSING,
    );
  }
  if (isMissing(applicant.occupation)) {
    push(
      'occupation_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_OCCUPATION_MISSING,
    );
  }
  if (isMissing(applicant.blsInvitingAuthority)) {
    push(
      'bls_inviting_authority_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_BLS_INVITING_AUTHORITY_MISSING,
    );
  }
  if (isMissing(applicant.invitingAuthorityName)) {
    push(
      'inviting_authority_name_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_AUTHORITY_NAME_MISSING,
    );
  }
  if (isMissing(applicant.invitingCountry)) {
    push(
      'inviting_country_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_COUNTRY_MISSING,
    );
  }
  if (isMissing(applicant.invitingCity)) {
    push(
      'inviting_city_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CITY_MISSING,
    );
  }
  if (isMissing(applicant.invitingZipCode)) {
    push(
      'inviting_zip_code_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_ZIP_CODE_MISSING,
    );
  }
  if (isMissing(applicant.invitingAddress)) {
    push(
      'inviting_address_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_ADDRESS_MISSING,
    );
  }
  if (isMissing(applicant.invitingEmail)) {
    push(
      'inviting_email_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_EMAIL_MISSING,
    );
  }
  if (isMissing(applicant.invitingContactNo)) {
    push(
      'inviting_contact_no_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_NO_MISSING,
    );
  }
  if (isMissing(applicant.invitingContactName)) {
    push(
      'inviting_contact_name_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_NAME_MISSING,
    );
  }
  if (isMissing(applicant.invitingContactSurname)) {
    push(
      'inviting_contact_surname_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_SURNAME_MISSING,
    );
  }
  if (isMissing(applicant.invitingContactCountry)) {
    push(
      'inviting_contact_country_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_COUNTRY_MISSING,
    );
  }
  if (isMissing(applicant.invitingContactCity)) {
    push(
      'inviting_contact_city_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_CITY_MISSING,
    );
  }
  if (isMissing(applicant.invitingContactZipCode)) {
    push(
      'inviting_contact_zip_code_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_ZIP_CODE_MISSING,
    );
  }
  if (isMissing(applicant.invitingContactAddress)) {
    push(
      'inviting_contact_address_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_ADDRESS_MISSING,
    );
  }
  if (isMissing(applicant.invitingContactContactNo)) {
    push(
      'inviting_contact_contact_no_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_CONTACT_NO_MISSING,
    );
  }
  if (isMissing(applicant.invitingContactEmail)) {
    push(
      'inviting_contact_email_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_INVITING_CONTACT_EMAIL_MISSING,
    );
  }
  if (isMissing(applicant.costCoveredBy)) {
    push(
      'cost_covered_by_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_COST_COVERED_BY_MISSING,
    );
  }
  if (isMissing(applicant.meansOfSupport)) {
    push(
      'means_of_support_missing',
      BLS_APPLICANT_COMPLETENESS_MSG_MEANS_OF_SUPPORT_MISSING,
    );
  }

  return violations;
};
