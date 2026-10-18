import { BLS_WORKFLOW_STATUS } from '../constants';
import { isBlsWorkflowStatusTerminal } from './is-bls-workflow-status-terminal.util';

/**
 * True when the runner must not execute or auto-schedule
 * (PAUSED ∪ terminal statuses — DEC-006 / REQ-001 / REQ-002).
 */
export const isBlsWorkflowStatusNonRunnable = (status: string): boolean =>
  status === BLS_WORKFLOW_STATUS.PAUSED || isBlsWorkflowStatusTerminal(status);
