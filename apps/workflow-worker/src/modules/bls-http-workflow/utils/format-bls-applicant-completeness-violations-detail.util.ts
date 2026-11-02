import { BLS_APPLICANT_COMPLETENESS_DETAIL_SEPARATOR } from '../constants/bls-applicant-completeness.constants';
import type { BlsApplicantCompletenessViolation } from '../types/bls-applicant-completeness.types';

/**
 * Aggregate Completeness violations into one Russian `{ detail }` string
 * (DEC-004 / DEC-006). Application-level lines omit the applicant prefix.
 */
export const formatBlsApplicantCompletenessViolationsDetail = (
  violations: BlsApplicantCompletenessViolation[],
): string =>
  violations
    .map((v) => {
      const label = String(v.applicantLabel ?? '').trim();
      if (label.length > 0) {
        return `${label}: ${v.message}`;
      }
      return v.message;
    })
    .join(BLS_APPLICANT_COMPLETENESS_DETAIL_SEPARATOR);
