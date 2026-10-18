import {
  BLS_WORKFLOW_TERMINAL_STATUSES,
} from '../constants/bls-workflow.constants';

/** Whether workflow status is terminal (no further runner work). */
export const isBlsWorkflowStatusTerminal = (status: string): boolean =>
  (BLS_WORKFLOW_TERMINAL_STATUSES as readonly string[]).includes(status);
