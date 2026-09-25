import { PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON } from '../constants';
import type { CaptchaCircuitBreaker } from '../types';

/**
 * Gate captcha-service HTTP before a new solve request (DEC-003).
 * Open + cooldown elapsed → half-open and allow one probe.
 * Still open within cooldown → throw explicit circuit-open reason.
 */
export const assertCaptchaCircuitAllowsCall = (
  breaker: CaptchaCircuitBreaker,
  nowMs: number,
): void => {
  if (breaker.state === 'closed' || breaker.state === 'half-open') {
    return;
  }

  if (
    breaker.openedAtMs !== null &&
    nowMs - breaker.openedAtMs >= breaker.openDurationMs
  ) {
    breaker.state = 'half-open';
    return;
  }

  throw new Error(PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON);
};
