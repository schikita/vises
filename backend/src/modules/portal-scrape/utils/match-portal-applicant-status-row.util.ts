import type {
  PortalApplicantStatusRow,
  PortalStatusApplicantMatchHint,
} from '../types/portal-status.types';

/**
 * Match a Manage Applicants row to the CRM applicant for this STATUS_APPLICANT
 * task (name tokens, else ordinal, else single-row fallback).
 */
export const matchPortalApplicantStatusRow = (input: {
  rows: PortalApplicantStatusRow[];
  applicant: PortalStatusApplicantMatchHint;
}): PortalApplicantStatusRow | null => {
  const { rows, applicant } = input;
  if (rows.length === 0) {
    return null;
  }

  const first = (applicant.firstName ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  const last = (applicant.lastName ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  if (first || last) {
    const byName = rows.find((row) => {
      const name = row.nameText.replace(/\s+/g, ' ').trim().toLowerCase();
      if (!name) return false;
      if (first && last) {
        return name.includes(first) && name.includes(last);
      }
      if (last) return name.includes(last);
      return name.includes(first);
    });
    if (byName) {
      return byName;
    }
  }

  if (
    applicant.ordinalIndex >= 0 &&
    applicant.ordinalIndex < rows.length
  ) {
    return rows[applicant.ordinalIndex] ?? null;
  }

  if (rows.length === 1) {
    return rows[0] ?? null;
  }

  return null;
};
