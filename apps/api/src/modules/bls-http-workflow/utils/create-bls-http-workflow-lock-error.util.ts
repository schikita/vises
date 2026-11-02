import {
  BLS_WORKFLOW_LOCK_ERROR_NAME,
} from '../constants/bls-http-workflow.constants';
import type {
  BlsHttpWorkflowLockError,
  CreateBlsHttpWorkflowLockErrorInput,
} from '../types/bls-http-workflow-lock.types';

/** Build a typed live-lock conflict (409-ready; no secrets in message). */
export const createBlsHttpWorkflowLockError = (
  input: CreateBlsHttpWorkflowLockErrorInput,
): BlsHttpWorkflowLockError => {
  const err = new Error(input.message) as BlsHttpWorkflowLockError;
  err.name = BLS_WORKFLOW_LOCK_ERROR_NAME;
  err.code = input.code;
  err.httpStatus = input.httpStatus ?? 409;
  return err;
};
