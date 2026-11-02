import { isBlsHttpWorkflowStatusTerminal } from './is-bls-http-workflow-status-terminal.util'

/** Whether staff cancel is allowed (non-terminal workflow). */
export const isBlsHttpWorkflowCancelEligible = (workflowStatus: string): boolean =>
  !isBlsHttpWorkflowStatusTerminal(workflowStatus)
