import {
  BLS_WORKFLOW_STEP_DONE_STATUSES,
} from '../constants/bls-workflow.constants';

/** Whether a step status is finished (COMPLETED / SKIPPED / FAILED). */
export const isBlsWorkflowStepDoneStatus = (status: string): boolean =>
  (BLS_WORKFLOW_STEP_DONE_STATUSES as readonly string[]).includes(status);
