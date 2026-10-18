import { TEMPORARY_EMAIL_CLIENT_ERROR_NAME } from '../constants';
import type { TemporaryEmailClientError } from '../types';

export const isTemporaryEmailClientError = (err: unknown): err is TemporaryEmailClientError =>
  err instanceof Error &&
  err.name === TEMPORARY_EMAIL_CLIENT_ERROR_NAME &&
  ((err as TemporaryEmailClientError).failureClass === 'transient' ||
    (err as TemporaryEmailClientError).failureClass === 'permanent' ||
    (err as TemporaryEmailClientError).failureClass === 'soft') &&
  typeof (err as TemporaryEmailClientError).phase === 'string';
