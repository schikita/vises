import { BLS_WORKFLOW_STATUS } from '../constants';
import { isBlsHttpWorkflowStatusTerminal } from './is-bls-http-workflow-status-terminal.util';

/**
 * True when the runner must not execute or auto-schedule
 * (PAUSED ∪ terminal statuses — DEC-006 / REQ-001 / REQ-002).
 */
export const isBlsHttpWorkflowStatusNonRunnable = (status: string): boolean =>
  status === BLS_WORKFLOW_STATUS.PAUSED || isBlsHttpWorkflowStatusTerminal(status);
