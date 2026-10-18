/**
 * CapMonster client failure taxonomy (DEC-001 / REQ-004).
 */

export type CapMonsterFailureClass = 'transient' | 'permanent';

export type CapMonsterFailureClassifyInput =
  | {
      source: 'business';
      errorId: number;
      errorCode?: string | null;
    }
  | { source: 'http_status'; httpStatus: number }
  | {
      source: 'transport';
      reason: 'network' | 'abort' | 'timeout_budget' | 'unparsed_status';
    }
  | { source: 'poll_timeout' }
  | { source: 'validation' }
  | { source: 'unknown' };

export type CreateCapMonsterClientErrorInput = {
  message: string;
  failureClass: CapMonsterFailureClass;
  phase: string;
  errorCode?: string;
  httpStatus?: number;
};

export type CapMonsterClientError = Error & {
  name: 'CapMonsterClientError';
  failureClass: CapMonsterFailureClass;
  phase: string;
  errorCode?: string;
  httpStatus?: number;
};
