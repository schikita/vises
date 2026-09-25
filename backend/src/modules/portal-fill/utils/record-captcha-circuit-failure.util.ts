import type { CapMonsterFailureClass } from '../../capmonster/types/capmonster-client-error.types';
import type {
  CaptchaCircuitBreaker,
  CaptchaCircuitRecordFailureResult,
} from '../types';

/**
 * Advance CB on captcha-service-classified failure only (DEC-003 / DEC-004).
 * Portal extract/apply/wrong-answer must not call this helper.
 */
export const recordCaptchaCircuitFailure = (
  breaker: CaptchaCircuitBreaker,
  failureClass: CapMonsterFailureClass,
  nowMs: number,
): CaptchaCircuitRecordFailureResult => {
  if (failureClass === 'permanent') {
    return { outcome: 'fail_fast', reason: 'permanent' };
  }

  if (breaker.state === 'half-open') {
    breaker.state = 'open';
    breaker.openedAtMs = nowMs;
    breaker.consecutiveTransientFailures = breaker.failureThreshold;
    return { outcome: 'circuit_open', state: 'open', opened: true };
  }

  breaker.consecutiveTransientFailures += 1;
  if (breaker.consecutiveTransientFailures >= breaker.failureThreshold) {
    breaker.state = 'open';
    breaker.openedAtMs = nowMs;
    return { outcome: 'circuit_open', state: 'open', opened: true };
  }

  return {
    outcome: 'continue',
    state: breaker.state,
    opened: false,
  };
};
