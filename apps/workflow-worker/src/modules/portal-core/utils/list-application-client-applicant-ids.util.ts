/**
 * 1:1 Client↔Application applicant id list (client id when present).
 * Replaces reads of dropped `applications.applicants` jsonb for id enumeration.
 */
export const listApplicationClientApplicantIds = (
  clientId: string | null | undefined,
): string[] => {
  const id = clientId?.trim() ?? '';
  return id.length > 0 ? [id] : [];
};
