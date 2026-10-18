import type { TemporaryEmailCircuitBreaker } from '../types';

/**
 * Protected temporary email create/wait success resets consecutive transient count (DEC-002).
 * Half-open probe success closes the breaker.
 */
export const recordTemporaryEmailCircuitSuccess = (
  breaker: TemporaryEmailCircuitBreaker,
): void => {
  breaker.state = 'closed';
  breaker.consecutiveTransientFailures = 0;
  breaker.openedAtMs = null;
};
