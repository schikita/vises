import type {
  MailTmCircuitBreaker,
  MailTmCircuitRecordFailureResult,
  MailTmFailureClass,
} from '../types';

/**
 * Advance Mail.tm CB on classified create/wait failure only (DEC-002 / DEC-005).
 * Soft (delete) must not be recorded toward open; permanent → fail_fast.
 */
export const recordMailTmCircuitFailure = (
  breaker: MailTmCircuitBreaker,
  failureClass: MailTmFailureClass,
  nowMs: number,
): MailTmCircuitRecordFailureResult => {
  if (failureClass === 'soft') {
    return {
      outcome: 'continue',
      state: breaker.state,
      opened: false,
    };
  }

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
