import { MAILTM_CLIENT_ERROR_NAME } from '../constants';
import type {
  CreateMailTmClientErrorInput,
  MailTmClientError,
} from '../types';

/** Build a typed Mail.tm client error (no secrets in message). */
export const createMailTmClientError = (
  input: CreateMailTmClientErrorInput,
): MailTmClientError => {
  const err = new Error(input.message) as MailTmClientError;
  err.name = MAILTM_CLIENT_ERROR_NAME;
  err.failureClass = input.failureClass;
  err.phase = input.phase;
  if (input.httpStatus !== undefined) {
    err.httpStatus = input.httpStatus;
  }
  return err;
};
