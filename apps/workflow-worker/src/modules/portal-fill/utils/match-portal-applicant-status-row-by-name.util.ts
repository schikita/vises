import type {
  PortalApplicantStatusRow,
  PortalStatusApplicantMatchHint,
} from '../types/portal-status.types';

/**
 * Match Manage Applicants row by first/last name tokens only.
 * Used for Add Family Member open-path detection so ordinal / single-row
 * fallback cannot bind a missing extra to the primary row (OQ-005).
 */
export const matchPortalApplicantStatusRowByName = (input: {
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
  if (!first && !last) {
    return null;
  }

  const byName = rows.find((row) => {
    const name = row.nameText.replace(/\s+/g, ' ').trim().toLowerCase();
    if (!name) {
      return false;
    }
    if (first && last) {
      return name.includes(first) && name.includes(last);
    }
    if (last) {
      return name.includes(last);
    }
    return name.includes(first);
  });

  return byName ?? null;
};
