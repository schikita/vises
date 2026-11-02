import { BLS_WORKFLOW_MAILBOX_CLEANUP_STATUSES } from '../constants/bls-http-workflow.constants';

/**
 * Whether status schedules deferred temporary email / MAILBOX_* cleanup (REQ-016 amends).
 * Also gates portal-credentials reveal (DEC-002).
 */
export const isBlsHttpWorkflowMailboxCleanupEligible = (
  status: string,
): boolean =>
  (BLS_WORKFLOW_MAILBOX_CLEANUP_STATUSES as readonly string[]).includes(status);
