import {
  PORTAL_CAPMONSTER_CB_FAILURE_THRESHOLD,
  PORTAL_CAPMONSTER_CB_OPEN_MS,
} from '../constants';
import type { CaptchaCircuitBreaker } from '../types';

/** Create a closed run-scoped captcha circuit-breaker (DEC-003). */
export const createCaptchaCircuitBreaker = (): CaptchaCircuitBreaker => ({
  state: 'closed',
  consecutiveTransientFailures: 0,
  openedAtMs: null,
  failureThreshold: PORTAL_CAPMONSTER_CB_FAILURE_THRESHOLD,
  openDurationMs: PORTAL_CAPMONSTER_CB_OPEN_MS,
});
