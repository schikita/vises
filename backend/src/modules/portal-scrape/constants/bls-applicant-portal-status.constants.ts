/**
 * Finite applicant portal status enum (REQ-018 / TASK-011).
 * UNKNOWN is never treated as success.
 */
export const BLS_APPLICANT_PORTAL_STATUS = {
  FORM_FILLING_IN_PROGRESS: 'FORM_FILLING_IN_PROGRESS',
  READY_TO_BOOK: 'READY_TO_BOOK',
  UNKNOWN: 'UNKNOWN',
} as const;
