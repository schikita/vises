/**
 * temporary email failure taxonomy for circuit-breaker recording (DEC-005).
 */

export type TemporaryEmailFailureClass = 'transient' | 'permanent' | 'soft';

export type TemporaryEmailFailureClassifyInput =
  | { source: 'http_status'; httpStatus: number }
  | {
      source: 'transport';
      reason: 'network' | 'abort' | 'timeout_budget';
    }
  | { source: 'wait_timeout' }
  | { source: 'validation' }
  | { source: 'delete' }
  | { source: 'unknown' };

export type CreateTemporaryEmailClientErrorInput = {
  message: string;
  failureClass: TemporaryEmailFailureClass;
  phase: string;
  httpStatus?: number;
};

export type TemporaryEmailClientError = Error & {
  name: 'TemporaryEmailClientError';
  failureClass: TemporaryEmailFailureClass;
  phase: string;
  httpStatus?: number;
};
