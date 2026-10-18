import { BLS_APPLICANT_DATE_DETAIL_SEPARATOR } from '../constants/bls-applicant-date.constants';
import type { BlsApplicantDateViolation } from '../types/bls-applicant-date.types';

/**
 * Aggregate violations into one Russian `{ detail }` string (DEC-006).
 */
export const formatBlsApplicantDateViolationsDetail = (
  violations: BlsApplicantDateViolation[],
): string =>
  violations
    .map((v) => `${v.applicantLabel}: ${v.message}`)
    .join(BLS_APPLICANT_DATE_DETAIL_SEPARATOR);
