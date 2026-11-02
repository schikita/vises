import { BLS_WORKFLOW_STATUS } from '../constants'

/** Whether staff pause is allowed (active non-PAUSED). */
export const isBlsHttpWorkflowPauseEligible = (workflowStatus: string): boolean =>
  workflowStatus === BLS_WORKFLOW_STATUS.PENDING ||
  workflowStatus === BLS_WORKFLOW_STATUS.RUNNING ||
  workflowStatus === BLS_WORKFLOW_STATUS.WAITING_RETRY ||
  workflowStatus === BLS_WORKFLOW_STATUS.WAITING_STAFF
