import { BLS_WORKFLOW_MAILBOX_CLEANUP_STATUSES } from '../constants/bls-workflow.constants';

/** Whether status triggers Mail.tm delete + vault purge (REQ-016). */
export const isBlsWorkflowMailboxCleanupEligible = (
  status: string,
): boolean =>
  (BLS_WORKFLOW_MAILBOX_CLEANUP_STATUSES as readonly string[]).includes(status);
