import { BLS_WORKFLOW_LOCK_ERROR_NAME } from '../constants/bls-workflow.constants';
import type { BlsWorkflowLockError } from '../types/bls-workflow-lock.types';

/** Type guard for BlsWorkflowLockError (REQ-005). */
export const isBlsWorkflowLockError = (
  err: unknown,
): err is BlsWorkflowLockError =>
  err instanceof Error &&
  err.name === BLS_WORKFLOW_LOCK_ERROR_NAME &&
  typeof (err as BlsWorkflowLockError).code === 'string' &&
  typeof (err as BlsWorkflowLockError).httpStatus === 'number';
