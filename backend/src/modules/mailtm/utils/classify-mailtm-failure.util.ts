import {
  MAILTM_PERMANENT_HTTP_STATUSES,
  MAILTM_TRANSIENT_HTTP_STATUSES,
} from '../constants';
import type {
  MailTmFailureClass,
  MailTmFailureClassifyInput,
} from '../types';

const TRANSIENT_HTTP_STATUS_SET = new Set<number>(
  MAILTM_TRANSIENT_HTTP_STATUSES,
);
const PERMANENT_HTTP_STATUS_SET = new Set<number>(
  MAILTM_PERMANENT_HTTP_STATUSES,
);

/**
 * Pure Mail.tm failure classifier (DEC-005).
 * Soft delete outcomes must not open the CB; callers skip record for soft.
 * Per-poll HTTP 429 inside wait does not call record — only whole-call outcomes.
 */
export const classifyMailTmFailure = (
  input: MailTmFailureClassifyInput,
): MailTmFailureClass => {
  switch (input.source) {
    case 'http_status': {
      if (TRANSIENT_HTTP_STATUS_SET.has(input.httpStatus)) {
        return 'transient';
      }
      if (PERMANENT_HTTP_STATUS_SET.has(input.httpStatus)) {
        return 'permanent';
      }
      if (input.httpStatus >= 400 && input.httpStatus < 500) {
        return 'permanent';
      }
      return 'transient';
    }
    case 'transport':
      return 'transient';
    case 'wait_timeout':
      return 'transient';
    case 'validation':
      return 'permanent';
    case 'delete':
      return 'soft';
    case 'unknown':
      return 'permanent';
    default: {
      const _exhaustive: never = input;
      return _exhaustive;
    }
  }
};
