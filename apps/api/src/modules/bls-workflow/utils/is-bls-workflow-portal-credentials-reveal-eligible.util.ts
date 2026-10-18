import { isBlsWorkflowMailboxCleanupEligible } from './is-bls-workflow-mailbox-cleanup-eligible.util';

/**
 * Whether staff may reveal portal credentials for this workflow status (DEC-002).
 * Same set as mailbox-cleanup terminals.
 */
export const isBlsWorkflowPortalCredentialsRevealEligible = (
  status: string,
): boolean => isBlsWorkflowMailboxCleanupEligible(status);
