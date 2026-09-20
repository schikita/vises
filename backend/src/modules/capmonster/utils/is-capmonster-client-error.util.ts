import { CAPMONSTER_CLIENT_ERROR_NAME } from '../constants';
import type { CapMonsterClientError } from '../types';

export const isCapMonsterClientError = (
  err: unknown,
): err is CapMonsterClientError =>
  err instanceof Error &&
  err.name === CAPMONSTER_CLIENT_ERROR_NAME &&
  ((err as CapMonsterClientError).failureClass === 'transient' ||
    (err as CapMonsterClientError).failureClass === 'permanent') &&
  typeof (err as CapMonsterClientError).phase === 'string';
