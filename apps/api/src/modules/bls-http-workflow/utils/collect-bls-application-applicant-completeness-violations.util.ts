import { listApplicationApplicantIds } from '../../portal-core/utils/list-application-applicant-ids.util';
import { BLS_APPLICANT_COMPLETENESS_MSG_CLIENT_EMAIL_MISSING } from '../constants/bls-applicant-completeness.constants';
import type {
  BlsApplicantCompletenessFields,
  BlsApplicantCompletenessViolation,
} from '../types/bls-applicant-completeness.types';
import { validateBlsApplicantCompleteness } from './validate-bls-applicant-completeness.util';

/**
 * Collect Start Completeness violations for every workflow-participating
 * applicant plus application `clientEmail` (DEC-001 / REQ-007 / REQ-010).
 * Does not run Core/Extended date inequalities (CON-001).
 */
export const collectBlsApplicationApplicantCompletenessViolations = (input: {
  applicants: unknown;
  clientEmail: string;
}): BlsApplicantCompletenessViolation[] => {
  const applicantIds = listApplicationApplicantIds(input.applicants);
  const rows = Array.isArray(input.applicants) ? input.applicants : [];
  const violations: BlsApplicantCompletenessViolation[] = [];

  for (const applicantId of applicantIds) {
    const row = rows.find((entry) => {
      if (entry == null || typeof entry !== 'object' || !('id' in entry)) {
        return false;
      }
      return String((entry as { id: unknown }).id).trim() === applicantId;
    });

    let fields: BlsApplicantCompletenessFields = { id: applicantId };
    if (row != null && typeof row === 'object') {
      const record = row as Record<string, unknown>;
      fields = {
        id: applicantId,
        firstName:
          typeof record.firstName === 'string' ? record.firstName : undefined,
        lastName:
          typeof record.lastName === 'string' ? record.lastName : undefined,
        lastNameAtBirth:
          typeof record.lastNameAtBirth === 'string'
            ? record.lastNameAtBirth
            : undefined,
        dob: typeof record.dob === 'string' ? record.dob : undefined,
        countryOfBirth:
          typeof record.countryOfBirth === 'string'
            ? record.countryOfBirth
            : undefined,
        passportNumber:
          typeof record.passportNumber === 'string'
            ? record.passportNumber
            : undefined,
        passportIssued:
          typeof record.passportIssued === 'string'
            ? record.passportIssued
            : undefined,
        passportExpires:
          typeof record.passportExpires === 'string'
            ? record.passportExpires
            : undefined,
        passportType:
          typeof record.passportType === 'string'
            ? record.passportType
            : undefined,
        passportIssueCountry:
          typeof record.passportIssueCountry === 'string'
            ? record.passportIssueCountry
            : undefined,
        passportIssuedBy:
          typeof record.passportIssuedBy === 'string'
            ? record.passportIssuedBy
            : undefined,
        phone: typeof record.phone === 'string' ? record.phone : undefined,
      };
    }

    violations.push(
      ...validateBlsApplicantCompleteness({
        applicant: fields,
      }),
    );
  }

  if (String(input.clientEmail ?? '').trim().length === 0) {
    violations.push({
      ruleId: 'client_email_missing',
      applicantId: '',
      applicantLabel: '',
      message: BLS_APPLICANT_COMPLETENESS_MSG_CLIENT_EMAIL_MISSING,
    });
  }

  return violations;
};
