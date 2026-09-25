import type { ApplicationApplicant } from '../../database/types';

/** Display name for new client from primary applicant (DEC-003). */
export const deriveClientNameFromApplicants = (
  applicants: ApplicationApplicant[],
): string => {
  const primary = applicants[0];
  if (!primary) {
    return '';
  }
  const first = String(primary.firstName ?? '').trim();
  const last = String(primary.lastName ?? '').trim();
  return [first, last].filter(Boolean).join(' ');
};
