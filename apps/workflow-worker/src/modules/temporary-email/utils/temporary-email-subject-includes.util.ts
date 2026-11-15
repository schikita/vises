/**
 * Case-sensitive substring match for wait subject filter (REQ-003).
 * Empty needle → always true (no filter). Missing subject → false when filtering.
 */
export const temporaryEmailSubjectIncludes = (
  subject: string | undefined,
  subjectIncludes: string | undefined,
): boolean => {
  const needle = subjectIncludes?.trim() ?? '';
  if (needle.length === 0) {
    return true;
  }
  const haystack = subject ?? '';
  return haystack.includes(needle);
};
