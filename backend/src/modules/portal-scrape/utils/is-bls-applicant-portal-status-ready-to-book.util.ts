import { BLS_APPLICANT_PORTAL_STATUS } from '../constants/bls-applicant-portal-status.constants';
import type { BlsApplicantPortalStatus } from '../types/bls-applicant-portal-status.types';

/** True only for READY_TO_BOOK — UNKNOWN and FORM_FILLING are never success. */
export const isBlsApplicantPortalStatusReadyToBook = (
  status: BlsApplicantPortalStatus | null | undefined,
): boolean => status === BLS_APPLICANT_PORTAL_STATUS.READY_TO_BOOK;
