import type { MailTmCircuitBreaker } from '../types';

/**
 * Protected Mail.tm create/wait success resets consecutive transient count (DEC-002).
 * Half-open probe success closes the breaker.
 */
export const recordMailTmCircuitSuccess = (
  breaker: MailTmCircuitBreaker,
): void => {
  breaker.state = 'closed';
  breaker.consecutiveTransientFailures = 0;
  breaker.openedAtMs = null;
};
