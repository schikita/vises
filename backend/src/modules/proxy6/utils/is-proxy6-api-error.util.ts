import { PROXY6_API_ERROR_NAME } from '../constants';
import type { Proxy6ApiError } from '../types';

/** Type guard for Proxy6ApiError. */
export const isProxy6ApiError = (err: unknown): err is Proxy6ApiError =>
  err instanceof Error &&
  err.name === PROXY6_API_ERROR_NAME &&
  typeof (err as Proxy6ApiError).code === 'string';
