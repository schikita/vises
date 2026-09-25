/**
 * Minimal applicant shape for label resolution (DEC-004 / REQ-011).
 * Matches application form applicants when passed into the panel.
 */

/** Optional CRM applicant fields used to resolve a human label. */
export type BlsWorkflowApplicantLabelSource = {
  id: string
  firstName?: string
  lastName?: string
}
