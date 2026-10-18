import {
  BLS_WORKFLOW_LOCK_ERROR_NAME,
} from '../constants/bls-workflow.constants';
import type {
  BlsWorkflowLockError,
  CreateBlsWorkflowLockErrorInput,
} from '../types/bls-workflow-lock.types';

/** Build a typed live-lock conflict (409-ready; no secrets in message). */
export const createBlsWorkflowLockError = (
  input: CreateBlsWorkflowLockErrorInput,
): BlsWorkflowLockError => {
  const err = new Error(input.message) as BlsWorkflowLockError;
  err.name = BLS_WORKFLOW_LOCK_ERROR_NAME;
  err.code = input.code;
  err.httpStatus = input.httpStatus ?? 409;
  return err;
};
