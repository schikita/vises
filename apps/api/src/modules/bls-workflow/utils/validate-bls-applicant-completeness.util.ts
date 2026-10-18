import {
  BLS_APPLICANT_COMPLETENESS_MSG_COUNTRY_OF_BIRTH_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_DOB_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_FIRST_NAME_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_LAST_NAME_AT_BIRTH_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_LAST_NAME_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_EXPIRES_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_ISSUE_COUNTRY_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_ISSUED_BY_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_ISSUED_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_NUMBER_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PASSPORT_TYPE_MISSING,
  BLS_APPLICANT_COMPLETENESS_MSG_PHONE_INVALID_DIGITS,
  BLS_APPLICANT_COMPLETENESS_MSG_PHONE_MISSING,
  BLS_APPLICANT_COMPLETENESS_PHONE_DIGITS_LENGTH,
} from '../constants/bls-applicant-completeness.constants';
import type {
  BlsApplicantCompletenessViolation,
  ValidateBlsApplicantCompletenessInput,
} from '../types/bls-applicant-completeness.types';
import { digitsOnly } from '../../portal-core/utils/digits-only.util';
import { buildBlsApplicantDateIdentityLabel } from './build-bls-applicant-date-identity-label.util';

/**
 * Start Completeness required/format checks for one applicant (DEC-001, DEC-006).
 * Aggregates every failed Completeness rule; does not run Core/Extended date math.
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

  return violations;
};
