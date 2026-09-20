import {
  MAILTM_CB_FAILURE_THRESHOLD,
  MAILTM_CB_OPEN_MS,
} from '../constants';
import type { MailTmCircuitBreaker } from '../types';

/** Create a closed run-scoped Mail.tm circuit-breaker (DEC-002 / DEC-006). */
export const createMailTmCircuitBreaker = (): MailTmCircuitBreaker => ({
  state: 'closed',
  consecutiveTransientFailures: 0,
  openedAtMs: null,
  failureThreshold: MAILTM_CB_FAILURE_THRESHOLD,
  openDurationMs: MAILTM_CB_OPEN_MS,
});
