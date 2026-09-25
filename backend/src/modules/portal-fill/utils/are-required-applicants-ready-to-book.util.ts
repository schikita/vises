import { isBlsApplicantPortalStatusReadyToBook } from './is-bls-applicant-portal-status-ready-to-book.util';
import type { BlsApplicantPortalStatus } from '../types/bls-applicant-portal-status.types';

/**
 * Gate for BOOK: every required applicant must be READY_TO_BOOK (REQ-021).
 * Default required set = all provided statuses (empty → false).
 */
export const areRequiredApplicantsReadyToBook = (input: {
  statuses: ReadonlyArray<BlsApplicantPortalStatus>;
}): boolean => {
  if (input.statuses.length === 0) {
    return false;
  }
  return input.statuses.every((s) => isBlsApplicantPortalStatusReadyToBook(s));
};
