import { isBlsHttpWorkflowMailboxCleanupEligible } from './is-bls-http-workflow-mailbox-cleanup-eligible.util';

/**
 * Whether staff may reveal portal credentials for this workflow status (DEC-002).
 * Same set as mailbox-cleanup terminals.
 */
export const isBlsHttpWorkflowPortalCredentialsRevealEligible = (
  status: string,
): boolean => isBlsHttpWorkflowMailboxCleanupEligible(status);
