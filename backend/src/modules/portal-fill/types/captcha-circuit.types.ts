/**
 * Captcha run-scoped circuit-breaker types (DEC-003 / DEC-004).
 */

export type CaptchaCircuitState = 'closed' | 'open' | 'half-open';

export type CaptchaCircuitBreaker = {
  state: CaptchaCircuitState;
  consecutiveTransientFailures: number;
  openedAtMs: number | null;
  failureThreshold: number;
  openDurationMs: number;
};

export type CaptchaCircuitRecordFailureResult =
  | { outcome: 'fail_fast'; reason: 'permanent' }
  | { outcome: 'continue'; state: CaptchaCircuitState; opened: false }
  | { outcome: 'circuit_open'; state: 'open'; opened: true };
