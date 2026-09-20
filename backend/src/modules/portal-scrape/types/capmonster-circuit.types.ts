/**
 * CapMonster run-scoped circuit-breaker types (DEC-003 / DEC-004).
 */

export type CapMonsterCircuitState = 'closed' | 'open' | 'half-open';

export type CapMonsterCircuitBreaker = {
  state: CapMonsterCircuitState;
  consecutiveTransientFailures: number;
  openedAtMs: number | null;
  failureThreshold: number;
  openDurationMs: number;
};

export type CapMonsterCircuitRecordFailureResult =
  | { outcome: 'fail_fast'; reason: 'permanent' }
  | { outcome: 'continue'; state: CapMonsterCircuitState; opened: false }
  | { outcome: 'circuit_open'; state: 'open'; opened: true };
