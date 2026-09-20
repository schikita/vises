import { MAILTM_CLIENT_ERROR_NAME } from '../constants';
import type { MailTmClientError } from '../types';

export const isMailTmClientError = (err: unknown): err is MailTmClientError =>
  err instanceof Error &&
  err.name === MAILTM_CLIENT_ERROR_NAME &&
  ((err as MailTmClientError).failureClass === 'transient' ||
    (err as MailTmClientError).failureClass === 'permanent' ||
    (err as MailTmClientError).failureClass === 'soft') &&
  typeof (err as MailTmClientError).phase === 'string';
