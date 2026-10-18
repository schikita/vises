import {
  CAPMONSTER_PERMANENT_ERROR_CODES,
  CAPMONSTER_TRANSIENT_ERROR_CODES,
  CAPMONSTER_TRANSIENT_HTTP_STATUSES,
} from '../constants';
import type {
  CapMonsterFailureClass,
  CapMonsterFailureClassifyInput,
} from '../types';

const TRANSIENT_ERROR_CODE_SET = new Set<string>(CAPMONSTER_TRANSIENT_ERROR_CODES);
const PERMANENT_ERROR_CODE_SET = new Set<string>(
  CAPMONSTER_PERMANENT_ERROR_CODES,
);
const TRANSIENT_HTTP_STATUS_SET = new Set<number>(
  CAPMONSTER_TRANSIENT_HTTP_STATUSES,
);

/**
 * Pure CapMonster failure classifier (DEC-001 / NFR-005).
 * Unknown business `errorCode` → permanent; ambiguous non-2xx → transient.
 */
export const classifyCapMonsterFailure = (
  input: CapMonsterFailureClassifyInput,
): CapMonsterFailureClass => {
  switch (input.source) {
    case 'business': {
      if (input.errorId === 0) {
        return 'permanent';
      }
      const code = input.errorCode?.trim() ?? '';
      if (code !== '' && TRANSIENT_ERROR_CODE_SET.has(code)) {
        return 'transient';
      }
      if (code !== '' && PERMANENT_ERROR_CODE_SET.has(code)) {
        return 'permanent';
      }
      return 'permanent';
    }
    case 'http_status': {
      if (TRANSIENT_HTTP_STATUS_SET.has(input.httpStatus)) {
        return 'transient';
      }
      if (input.httpStatus >= 400 && input.httpStatus < 500) {
        return 'permanent';
      }
      return 'transient';
    }
    case 'transport':
      return 'transient';
    case 'poll_timeout':
      return 'transient';
    case 'validation':
      return 'permanent';
    case 'unknown':
      return 'permanent';
    default: {
      const _exhaustive: never = input;
      return _exhaustive;
    }
  }
};
