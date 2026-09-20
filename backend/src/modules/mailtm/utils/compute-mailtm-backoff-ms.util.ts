import {
  MAILTM_BACKOFF_INITIAL_MS,
  MAILTM_BACKOFF_MAX_MS,
} from '../constants';

/**
 * Compute 429 backoff within DEC-003: Retry-After if present, else exponential
 * 2s→4s→8s capped at 16s plus small jitter.
 */
export const computeMailTmBackoffMs = (
  attempt: number,
  retryAfterSeconds?: number,
): number => {
  if (
    retryAfterSeconds !== undefined &&
    Number.isFinite(retryAfterSeconds) &&
    retryAfterSeconds > 0
  ) {
    return Math.min(
      MAILTM_BACKOFF_MAX_MS,
      Math.ceil(retryAfterSeconds * 1000),
    );
  }
  const exp = Math.min(
    MAILTM_BACKOFF_MAX_MS,
    MAILTM_BACKOFF_INITIAL_MS * 2 ** Math.max(0, attempt),
  );
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(MAILTM_BACKOFF_MAX_MS, exp + jitter);
};
