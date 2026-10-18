import {
  TEMPORARY_EMAIL_CB_FAILURE_THRESHOLD,
  TEMPORARY_EMAIL_CB_OPEN_MS,
} from '../constants';
import type { TemporaryEmailCircuitBreaker } from '../types';

/** Create a closed run-scoped temporary email circuit-breaker (DEC-002 / DEC-006). */
export const createTemporaryEmailCircuitBreaker = (): TemporaryEmailCircuitBreaker => ({
  state: 'closed',
  consecutiveTransientFailures: 0,
  openedAtMs: null,
  failureThreshold: TEMPORARY_EMAIL_CB_FAILURE_THRESHOLD,
  openDurationMs: TEMPORARY_EMAIL_CB_OPEN_MS,
});
