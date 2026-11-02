import {
  BLS_WORKFLOW_STATUS,
  BLS_WORKFLOW_TASK_STATUS,
} from '../constants/bls-http-workflow.constants';

/**
 * Whether staff manual retry is allowed for workflow + task state (03-workflow-api §2.4).
 * Live lock is checked separately (409).
 */
export const isBlsHttpWorkflowManualRetryEligible = (input: {
  workflowStatus: string;
  taskStatus: string;
}): boolean => {
  const workflowOk =
    input.workflowStatus === BLS_WORKFLOW_STATUS.WAITING_STAFF ||
    input.workflowStatus === BLS_WORKFLOW_STATUS.WAITING_RETRY ||
    input.workflowStatus === BLS_WORKFLOW_STATUS.PAUSED;

  const taskOk =
    input.taskStatus === BLS_WORKFLOW_TASK_STATUS.FAILED ||
    input.taskStatus === BLS_WORKFLOW_TASK_STATUS.WAITING;

  return workflowOk && taskOk;
};
