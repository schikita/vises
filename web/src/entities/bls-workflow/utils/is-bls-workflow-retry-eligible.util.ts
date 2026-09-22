import {
  BLS_WORKFLOW_STATUS,
  BLS_WORKFLOW_TASK_STATUS,
} from '../constants'

/** Whether staff manual retry is allowed for workflow + task state. */
export const isBlsWorkflowRetryEligible = (input: {
  workflowStatus: string
  taskStatus: string | null
}): boolean => {
  if (input.taskStatus == null) return false
  const workflowOk =
    input.workflowStatus === BLS_WORKFLOW_STATUS.WAITING_STAFF ||
    input.workflowStatus === BLS_WORKFLOW_STATUS.WAITING_RETRY ||
    input.workflowStatus === BLS_WORKFLOW_STATUS.PAUSED
  const taskOk =
    input.taskStatus === BLS_WORKFLOW_TASK_STATUS.FAILED ||
    input.taskStatus === BLS_WORKFLOW_TASK_STATUS.WAITING
  return workflowOk && taskOk
}
