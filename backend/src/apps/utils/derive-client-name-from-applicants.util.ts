/** Display name for new client from primary applicant (DEC-003). */
export const deriveClientNameFromApplicants = (
  applicants: unknown[],
): string => {
  const primary = applicants[0];
  if (!primary || typeof primary !== 'object') {
    return '';
  }
  const record = primary as Record<string, unknown>;
  const first = String(record.firstName ?? '').trim();
  const last = String(record.lastName ?? '').trim();
  return [first, last].filter(Boolean).join(' ');
};
