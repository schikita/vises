import { BLS_WORKFLOW_TERMINAL_STATUSES } from '../constants'

/** Whether workflow status is terminal (stop staff poll). */
export const isBlsHttpWorkflowStatusTerminal = (status: string): boolean =>
  (BLS_WORKFLOW_TERMINAL_STATUSES as readonly string[]).includes(status)
