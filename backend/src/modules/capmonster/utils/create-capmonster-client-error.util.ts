import { CAPMONSTER_CLIENT_ERROR_NAME } from '../constants';
import type {
  CapMonsterClientError,
  CreateCapMonsterClientErrorInput,
} from '../types';

/** Build a typed CapMonster client error (no secrets in message). */
export const createCapMonsterClientError = (
  input: CreateCapMonsterClientErrorInput,
): CapMonsterClientError => {
  const err = new Error(input.message) as CapMonsterClientError;
  err.name = CAPMONSTER_CLIENT_ERROR_NAME;
  err.failureClass = input.failureClass;
  err.phase = input.phase;
  if (input.errorCode !== undefined) {
    err.errorCode = input.errorCode;
  }
  if (input.httpStatus !== undefined) {
    err.httpStatus = input.httpStatus;
  }
  return err;
};
