import {
  BLS_WORKFLOW_TASK_DONE_STATUSES,
} from '../constants/bls-workflow.constants';

/** Whether a task status is finished (COMPLETED / SKIPPED / FAILED). */
export const isBlsWorkflowTaskDoneStatus = (status: string): boolean =>
  (BLS_WORKFLOW_TASK_DONE_STATUSES as readonly string[]).includes(status);
