import { BLS_WORKFLOW_MAILBOX_CLEANUP_GRACE_MS } from '../constants/bls-workflow.constants';

/**
 * Grace deadline for deferred Mail.tm / MAILTM_* cleanup (DEC-004 / REQ-007).
 * `from` defaults to now; production grace is 72h.
 */
export const computeBlsWorkflowMailboxCleanupDueAt = (
  from: Date = new Date(),
): Date => new Date(from.getTime() + BLS_WORKFLOW_MAILBOX_CLEANUP_GRACE_MS);
