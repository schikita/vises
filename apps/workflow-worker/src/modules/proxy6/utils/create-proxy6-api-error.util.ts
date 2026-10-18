import { PROXY6_API_ERROR_NAME } from '../constants';
import type {
  CreateProxy6ApiErrorInput,
  Proxy6ApiError,
} from '../types';

/** Build a typed Proxy6 API failure (no secrets in message). */
export const createProxy6ApiError = (
  input: CreateProxy6ApiErrorInput,
): Proxy6ApiError => {
  const err = new Error(input.message) as Proxy6ApiError;
  err.name = PROXY6_API_ERROR_NAME;
  err.code = input.code;
  if (input.errorId !== undefined) {
    err.errorId = input.errorId;
  }
  if (input.httpStatus !== undefined) {
    err.httpStatus = input.httpStatus;
  }
  return err;
};
