/**
 * Mail.tm failure taxonomy for circuit-breaker recording (DEC-005).
 */

export type MailTmFailureClass = 'transient' | 'permanent' | 'soft';

export type MailTmFailureClassifyInput =
  | { source: 'http_status'; httpStatus: number }
  | {
      source: 'transport';
      reason: 'network' | 'abort' | 'timeout_budget';
    }
  | { source: 'wait_timeout' }
  | { source: 'validation' }
  | { source: 'delete' }
  | { source: 'unknown' };

export type CreateMailTmClientErrorInput = {
  message: string;
  failureClass: MailTmFailureClass;
  phase: string;
  httpStatus?: number;
};

export type MailTmClientError = Error & {
  name: 'MailTmClientError';
  failureClass: MailTmFailureClass;
  phase: string;
  httpStatus?: number;
};
