import { listApplicationApplicantIds } from '../../portal-core/utils/list-application-applicant-ids.util';
import { BLS_APPLICANT_COMPLETENESS_MSG_CLIENT_EMAIL_MISSING } from '../constants/bls-applicant-completeness.constants';
import type {
  BlsApplicantCompletenessFields,
  BlsApplicantCompletenessViolation,
} from '../types/bls-applicant-completeness.types';
import { pickOptionalStringField } from './pick-optional-string-field.util';
import { validateBlsApplicantCompleteness } from './validate-bls-applicant-completeness.util';

/**
 * Collect Start Completeness violations for every workflow-participating
 * applicant plus application `clientEmail` (DEC-001 / REQ-007 / REQ-010 / APF REQ-008).
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
        firstName: pickOptionalStringField(record, 'firstName'),
        lastName: pickOptionalStringField(record, 'lastName'),
        lastNameAtBirth: pickOptionalStringField(record, 'lastNameAtBirth'),
        dob: pickOptionalStringField(record, 'dob'),
        countryOfBirth: pickOptionalStringField(record, 'countryOfBirth'),
        passportNumber: pickOptionalStringField(record, 'passportNumber'),
        passportIssued: pickOptionalStringField(record, 'passportIssued'),
        passportExpires: pickOptionalStringField(record, 'passportExpires'),
        passportType: pickOptionalStringField(record, 'passportType'),
        passportIssueCountry: pickOptionalStringField(record, 'passportIssueCountry'),
        passportIssuedBy: pickOptionalStringField(record, 'passportIssuedBy'),
        phone: pickOptionalStringField(record, 'phone'),
        address: pickOptionalStringField(record, 'address'),
        homeCountry: pickOptionalStringField(record, 'homeCountry'),
        homeCity: pickOptionalStringField(record, 'homeCity'),
        homePostalCode: pickOptionalStringField(record, 'homePostalCode'),
        purpose: pickOptionalStringField(record, 'purpose'),
        firstEntry: pickOptionalStringField(record, 'firstEntry'),
        entries: pickOptionalStringField(record, 'entries'),
        durationDays: pickOptionalStringField(record, 'durationDays'),
        employerName: pickOptionalStringField(record, 'employerName'),
        employerPhone: pickOptionalStringField(record, 'employerPhone'),
        employerAddress: pickOptionalStringField(record, 'employerAddress'),
        occupation: pickOptionalStringField(record, 'occupation'),
        blsInvitingAuthority: pickOptionalStringField(record, 'blsInvitingAuthority'),
        invitingAuthorityName: pickOptionalStringField(
          record,
          'invitingAuthorityName',
        ),
        invitingCountry: pickOptionalStringField(record, 'invitingCountry'),
        invitingCity: pickOptionalStringField(record, 'invitingCity'),
        invitingZipCode: pickOptionalStringField(record, 'invitingZipCode'),
        invitingAddress: pickOptionalStringField(record, 'invitingAddress'),
        invitingEmail: pickOptionalStringField(record, 'invitingEmail'),
        invitingContactNo: pickOptionalStringField(record, 'invitingContactNo'),
        invitingContactName: pickOptionalStringField(record, 'invitingContactName'),
        invitingContactSurname: pickOptionalStringField(
          record,
          'invitingContactSurname',
        ),
        invitingContactCountry: pickOptionalStringField(
          record,
          'invitingContactCountry',
        ),
        invitingContactCity: pickOptionalStringField(record, 'invitingContactCity'),
        invitingContactZipCode: pickOptionalStringField(
          record,
          'invitingContactZipCode',
        ),
        invitingContactAddress: pickOptionalStringField(
          record,
          'invitingContactAddress',
        ),
        invitingContactContactNo: pickOptionalStringField(
          record,
          'invitingContactContactNo',
        ),
        invitingContactEmail: pickOptionalStringField(
          record,
          'invitingContactEmail',
        ),
        costCoveredBy: pickOptionalStringField(record, 'costCoveredBy'),
        meansOfSupport: pickOptionalStringField(record, 'meansOfSupport'),
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
