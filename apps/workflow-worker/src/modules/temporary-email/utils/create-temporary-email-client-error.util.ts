import { TEMPORARY_EMAIL_CLIENT_ERROR_NAME } from '../constants';
import type {
  CreateTemporaryEmailClientErrorInput,
  TemporaryEmailClientError,
} from '../types';

/** Build a typed temporary email client error (no secrets in message). */
export const createTemporaryEmailClientError = (
  input: CreateTemporaryEmailClientErrorInput,
): TemporaryEmailClientError => {
  const err = new Error(input.message) as TemporaryEmailClientError;
  err.name = TEMPORARY_EMAIL_CLIENT_ERROR_NAME;
  err.failureClass = input.failureClass;
  err.phase = input.phase;
  if (input.httpStatus !== undefined) {
    err.httpStatus = input.httpStatus;
  }
  return err;
};
