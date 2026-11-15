/**
 * Family-member branch token for Manage Applicants checkpoints (OQ-005).
 * Only set when the application already has additional members pre-start.
 */
export const PORTAL_STATUS_MEMBER_BRANCH = {
  EDIT_EXISTING: 'EDIT_EXISTING',
  ADD_NEW_MEMBER: 'ADD_NEW_MEMBER',
} as const;
