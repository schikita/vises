import type { CapMonsterCircuitBreaker } from '../types';

/**
 * CapMonster API success (`ready`) resets consecutive transient count (DEC-003).
 * Does not imply portal Verified success.
 */
export const recordCapMonsterCircuitSuccess = (
  breaker: CapMonsterCircuitBreaker,
): void => {
  breaker.state = 'closed';
  breaker.consecutiveTransientFailures = 0;
  breaker.openedAtMs = null;
};
