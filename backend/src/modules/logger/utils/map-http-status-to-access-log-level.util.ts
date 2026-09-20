import type { HttpAccessLogLevel } from '../types';

/**
 * Map final HTTP status to access-log severity (REQ-009).
 * status < 400 → info; 400–499 → warn; ≥500 → error.
 */
export const mapHttpStatusToAccessLogLevel = (
  status: number,
): HttpAccessLogLevel => {
  if (status >= 500) {
    return 'error';
  }
  if (status >= 400) {
    return 'warn';
  }
  return 'info';
};
