/**
 * Mail.tm run-scoped circuit-breaker types (DEC-002 / DEC-006).
 */

export type MailTmCircuitState = 'closed' | 'open' | 'half-open';

export type MailTmCircuitBreaker = {
  state: MailTmCircuitState;
  consecutiveTransientFailures: number;
  openedAtMs: number | null;
  failureThreshold: number;
  openDurationMs: number;
};

export type MailTmCircuitRecordFailureResult =
  | { outcome: 'fail_fast'; reason: 'permanent' }
  | { outcome: 'continue'; state: MailTmCircuitState; opened: false }
  | { outcome: 'circuit_open'; state: 'open'; opened: true };

/** Optional run-scoped breaker passed into protected Mail.tm calls (DEC-002). */
export type MailTmCircuitCallOptions = {
  circuit?: MailTmCircuitBreaker;
};
