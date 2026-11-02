import { listApplicationApplicantIds } from '../../portal-core/utils/list-application-applicant-ids.util';
import type {
  BlsApplicantDateFields,
  BlsApplicantDateViolation,
} from '../types/bls-applicant-date.types';
import { resolveUtcReferenceDateYmd } from './resolve-utc-reference-date-ymd.util';
import { validateBlsApplicantDates } from './validate-bls-applicant-dates.util';

/**
 * Collect Core + Extended date violations for every workflow-participating
 * applicant (DEC-006, DEC-011 / REQ-008).
 */
export const collectBlsApplicationApplicantDateViolations = (input: {
  applicants: unknown;
  returnDate: string;
  /** Optional override for tests; defaults to UTC `D` (DEC-004). */
  referenceDateYmd?: string;
}): BlsApplicantDateViolation[] => {
  const referenceDateYmd =
    input.referenceDateYmd ?? resolveUtcReferenceDateYmd();
  const applicantIds = listApplicationApplicantIds(input.applicants);
  const rows = Array.isArray(input.applicants) ? input.applicants : [];
  const violations: BlsApplicantDateViolation[] = [];

  for (const applicantId of applicantIds) {
    const row = rows.find((entry) => {
      if (entry == null || typeof entry !== 'object' || !('id' in entry)) {
        return false;
      }
      return String((entry as { id: unknown }).id).trim() === applicantId;
    });

    let fields: BlsApplicantDateFields = { id: applicantId };
    if (row != null && typeof row === 'object') {
      const record = row as Record<string, unknown>;
      fields = {
        id: applicantId,
        firstName:
          typeof record.firstName === 'string' ? record.firstName : undefined,
        lastName:
          typeof record.lastName === 'string' ? record.lastName : undefined,
        dob: typeof record.dob === 'string' ? record.dob : undefined,
        passportIssued:
          typeof record.passportIssued === 'string'
            ? record.passportIssued
            : undefined,
        passportExpires:
          typeof record.passportExpires === 'string'
            ? record.passportExpires
            : undefined,
      };
    }

    violations.push(
      ...validateBlsApplicantDates({
        applicant: fields,
        referenceDateYmd,
        returnDateRaw: input.returnDate,
      }),
    );
  }

  return violations;
};
