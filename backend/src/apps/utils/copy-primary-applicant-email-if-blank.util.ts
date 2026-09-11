/**
 * REQ-012: copy resolved client email onto primary applicant when blank.
 * Does not rewrite applicant ids (DEC-007).
 */
export const copyPrimaryApplicantEmailIfBlank = (
  applicants: unknown[],
  email: string,
): unknown[] => {
  if (!applicants.length || !email.trim()) {
    return applicants;
  }
  const primary = applicants[0];
  if (!primary || typeof primary !== 'object') {
    return applicants;
  }
  const record = { ...(primary as Record<string, unknown>) };
  const existing = String(record.email ?? '').trim();
  if (existing) {
    return applicants;
  }
  record.email = email.trim();
  return [record, ...applicants.slice(1)];
};
