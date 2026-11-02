import { BLS_WORKFLOW_STATUS } from '../constants'

/** Whether staff resume is allowed. */
export const isBlsHttpWorkflowResumeEligible = (workflowStatus: string): boolean =>
  workflowStatus === BLS_WORKFLOW_STATUS.PAUSED ||
  workflowStatus === BLS_WORKFLOW_STATUS.WAITING_RETRY ||
  workflowStatus === BLS_WORKFLOW_STATUS.WAITING_STAFF
