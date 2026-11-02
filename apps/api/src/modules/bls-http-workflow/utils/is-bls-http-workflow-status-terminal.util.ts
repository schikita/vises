import {
  BLS_WORKFLOW_TERMINAL_STATUSES,
} from '../constants/bls-http-workflow.constants';

/** Whether workflow status is terminal (no further runner work). */
export const isBlsHttpWorkflowStatusTerminal = (status: string): boolean =>
  (BLS_WORKFLOW_TERMINAL_STATUSES as readonly string[]).includes(status);
