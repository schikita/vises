import {
  BLS_WORKFLOW_ACTIVE_STATUSES,
} from '../constants/bls-workflow.constants';

/** Whether workflow status is non-terminal active (REQ-001 / DEC-013). */
export const isBlsWorkflowStatusActive = (status: string): boolean =>
  (BLS_WORKFLOW_ACTIVE_STATUSES as readonly string[]).includes(status);
