import { BLS_WORKFLOW_ACTIVE_STATUSES } from '../constants'

/** Whether workflow status is active (non-terminal). */
export const isBlsHttpWorkflowStatusActive = (status: string): boolean =>
  (BLS_WORKFLOW_ACTIVE_STATUSES as readonly string[]).includes(status)
