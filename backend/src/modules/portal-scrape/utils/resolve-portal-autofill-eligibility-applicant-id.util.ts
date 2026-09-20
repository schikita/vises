/**
 * Resolve which applicant id eligibility should use for staff list (TASK-004).
 * Priority: explicit query → newest in_progress → newest run → first app applicant.
 */
export const resolvePortalAutofillEligibilityApplicantId = (input: {
  queryApplicantId: string | null | undefined;
  runs: Array<{ applicantId: string; status: string | null }>;
  applicationApplicantIds: string[];
}): string | null => {
  const queried =
    typeof input.queryApplicantId === 'string'
      ? input.queryApplicantId.trim()
      : '';
  if (queried.length > 0) {
    return queried;
  }

  const inProgress = input.runs.find((r) => r.status === 'in_progress');
  if (inProgress != null) {
    return inProgress.applicantId;
  }

  if (input.runs.length > 0) {
    return input.runs[0].applicantId;
  }

  if (input.applicationApplicantIds.length > 0) {
    return input.applicationApplicantIds[0] ?? null;
  }

  return null;
};
