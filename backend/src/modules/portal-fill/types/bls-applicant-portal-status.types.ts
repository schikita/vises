import type { BLS_APPLICANT_PORTAL_STATUS } from '../constants/bls-applicant-portal-status.constants';

/** Normalized applicant portal status (REQ-018). UNKNOWN ≠ success. */
export type BlsApplicantPortalStatus =
  (typeof BLS_APPLICANT_PORTAL_STATUS)[keyof typeof BLS_APPLICANT_PORTAL_STATUS];
