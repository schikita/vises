import type { ApplicationApplicant } from '../../database/types';

/**
 * REQ-012: copy resolved client email onto primary applicant when blank.
 * Does not rewrite applicant ids (DEC-007).
 */
export const copyPrimaryApplicantEmailIfBlank = (
  applicants: ApplicationApplicant[],
  email: string,
): ApplicationApplicant[] => {
  if (!applicants.length || !email.trim()) {
    return applicants;
  }
  const primary = applicants[0];
  if (!primary || typeof primary !== 'object') {
    return applicants;
  }
  const existing = String(primary.email ?? '').trim();
  if (existing) {
    return applicants;
  }
  return [{ ...primary, email: email.trim() }, ...applicants.slice(1)];
};
