import {
  BLS_WORKFLOW_ACTIVE_STATUSES,
} from '../constants/bls-http-workflow.constants';

/** Whether workflow status is non-terminal active (REQ-001 / DEC-013). */
export const isBlsHttpWorkflowStatusActive = (status: string): boolean =>
  (BLS_WORKFLOW_ACTIVE_STATUSES as readonly string[]).includes(status);
