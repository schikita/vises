import type { CapMonsterFailureClass } from '../../capmonster';
import type {
  CapMonsterCircuitBreaker,
  CapMonsterCircuitRecordFailureResult,
} from '../types';

/**
 * Advance CB on CapMonster-classified failure only (DEC-003 / DEC-004).
 * Portal extract/apply/wrong-answer must not call this helper.
 */
export const recordCapMonsterCircuitFailure = (
  breaker: CapMonsterCircuitBreaker,
  failureClass: CapMonsterFailureClass,
  nowMs: number,
): CapMonsterCircuitRecordFailureResult => {
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
