import { isBlsWorkflowStatusTerminal } from './is-bls-workflow-status-terminal.util'

/** Whether staff cancel is allowed (non-terminal workflow). */
export const isBlsWorkflowCancelEligible = (workflowStatus: string): boolean =>
  !isBlsWorkflowStatusTerminal(workflowStatus)
