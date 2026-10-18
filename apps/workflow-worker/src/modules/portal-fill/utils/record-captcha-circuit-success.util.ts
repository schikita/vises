import type { CaptchaCircuitBreaker } from '../types';

/**
 * Captcha-service API success (`ready`) resets consecutive transient count (DEC-003).
 * Does not imply portal Verified success.
 */
export const recordCaptchaCircuitSuccess = (
  breaker: CaptchaCircuitBreaker,
): void => {
  breaker.state = 'closed';
  breaker.consecutiveTransientFailures = 0;
  breaker.openedAtMs = null;
};
