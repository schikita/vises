/**
 * temporary email run-scoped circuit-breaker types (DEC-002 / DEC-006).
 */

export type TemporaryEmailCircuitState = 'closed' | 'open' | 'half-open';

export type TemporaryEmailCircuitBreaker = {
  state: TemporaryEmailCircuitState;
  consecutiveTransientFailures: number;
  openedAtMs: number | null;
  failureThreshold: number;
  openDurationMs: number;
};

export type TemporaryEmailCircuitRecordFailureResult =
  | { outcome: 'fail_fast'; reason: 'permanent' }
  | { outcome: 'continue'; state: TemporaryEmailCircuitState; opened: false }
  | { outcome: 'circuit_open'; state: 'open'; opened: true };
