import { BLS_WORKFLOW_LOCK_ERROR_NAME } from '../constants/bls-http-workflow.constants';
import type { BlsHttpWorkflowLockError } from '../types/bls-http-workflow-lock.types';

/** Type guard for BlsHttpWorkflowLockError (REQ-005). */
export const isBlsHttpWorkflowLockError = (
  err: unknown,
): err is BlsHttpWorkflowLockError =>
  err instanceof Error &&
  err.name === BLS_WORKFLOW_LOCK_ERROR_NAME &&
  typeof (err as BlsHttpWorkflowLockError).code === 'string' &&
  typeof (err as BlsHttpWorkflowLockError).httpStatus === 'number';
