import {
  BLS_WORKFLOW_STEP_DONE_STATUSES,
} from '../constants/bls-http-workflow.constants';

/** Whether a step status is finished (COMPLETED / SKIPPED / FAILED). */
export const isBlsHttpWorkflowStepDoneStatus = (status: string): boolean =>
  (BLS_WORKFLOW_STEP_DONE_STATUSES as readonly string[]).includes(status);
