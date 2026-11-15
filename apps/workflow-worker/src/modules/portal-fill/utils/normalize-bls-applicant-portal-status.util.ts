import { BLS_APPLICANT_PORTAL_STATUS } from '../constants/bls-applicant-portal-status.constants';
import { PORTAL_APPLICANT_STATUS_LABELS } from '../constants/portal-status.constants';
import type { BlsApplicantPortalStatus } from '../types/bls-applicant-portal-status.types';

const collapseLabel = (raw: string): string =>
  raw.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Normalize a scraped portal status label (OQ-006 / REQ-018).
 * Prefer **exact** portal label text; fuzzy includes are secondary only.
 * CSS class matching belongs in the scrape helper — never class-only here.
 */
export const normalizeBlsApplicantPortalStatus = (
  raw: string | null | undefined,
): BlsApplicantPortalStatus => {
  const collapsed = collapseLabel(raw ?? '');
  if (!collapsed) {
    return BLS_APPLICANT_PORTAL_STATUS.UNKNOWN;
  }

  const formFillingExact = collapseLabel(
    PORTAL_APPLICANT_STATUS_LABELS.FORM_FILLING_IN_PROGRESS,
  );
  const readyExact = collapseLabel(PORTAL_APPLICANT_STATUS_LABELS.READY_TO_BOOK);

  // Exact label match first (OQ-006).
  if (collapsed === readyExact) {
    return BLS_APPLICANT_PORTAL_STATUS.READY_TO_BOOK;
  }
  if (collapsed === formFillingExact) {
    return BLS_APPLICANT_PORTAL_STATUS.FORM_FILLING_IN_PROGRESS;
  }

  // Secondary: label contained in a longer scraped cell (still text-first).
  if (collapsed.includes(readyExact)) {
    return BLS_APPLICANT_PORTAL_STATUS.READY_TO_BOOK;
  }
  if (collapsed.includes(formFillingExact)) {
    return BLS_APPLICANT_PORTAL_STATUS.FORM_FILLING_IN_PROGRESS;
  }

  return BLS_APPLICANT_PORTAL_STATUS.UNKNOWN;
};
