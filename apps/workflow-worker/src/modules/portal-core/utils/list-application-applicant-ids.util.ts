/**
 * Extract applicant ids from a Client-derived applicant list view
 * (light list-time check; not Application entity jsonb).
 */
export const listApplicationApplicantIds = (
  applicants: unknown,
): string[] => {
  if (!Array.isArray(applicants)) {
    return [];
  }
  const ids: string[] = [];
  for (const row of applicants) {
    if (row != null && typeof row === 'object' && 'id' in row) {
      const id = (row as { id: unknown }).id;
      if (id != null && String(id).trim().length > 0) {
        ids.push(String(id));
      }
    }
  }
  return ids;
};
