import { BLS_APPLICANT_PORTAL_STATUS } from '../constants/bls-applicant-portal-status.constants';
import { PORTAL_APPLICANT_STATUS_LABELS } from '../constants/portal-status.constants';
import type { BlsApplicantPortalStatus } from '../types/bls-applicant-portal-status.types';

/**
 * Normalize a scraped portal status label to the finite enum (REQ-018).
 * Unknown / empty labels → UNKNOWN (never success).
 */
export const normalizeBlsApplicantPortalStatus = (
  raw: string | null | undefined,
): BlsApplicantPortalStatus => {
  const collapsed = (raw ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
  if (!collapsed) {
    return BLS_APPLICANT_PORTAL_STATUS.UNKNOWN;
  }

  const formFilling = PORTAL_APPLICANT_STATUS_LABELS.FORM_FILLING_IN_PROGRESS.replace(
    /\s+/g,
    ' ',
  )
    .trim()
    .toLowerCase();
  if (collapsed === formFilling || collapsed.includes(formFilling)) {
    return BLS_APPLICANT_PORTAL_STATUS.FORM_FILLING_IN_PROGRESS;
  }

  const ready = PORTAL_APPLICANT_STATUS_LABELS.READY_TO_BOOK.replace(
    /\s+/g,
    ' ',
  )
    .trim()
    .toLowerCase();
  if (collapsed === ready || collapsed.includes(ready)) {
    return BLS_APPLICANT_PORTAL_STATUS.READY_TO_BOOK;
  }

  // Observed shorter cue without "Appointment".
  if (collapsed.includes('ready to book')) {
    return BLS_APPLICANT_PORTAL_STATUS.READY_TO_BOOK;
  }

  if (
    collapsed.includes('form filling') &&
    collapsed.includes('in-progress')
  ) {
    return BLS_APPLICANT_PORTAL_STATUS.FORM_FILLING_IN_PROGRESS;
  }

  return BLS_APPLICANT_PORTAL_STATUS.UNKNOWN;
};
