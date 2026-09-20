import type { HttpAccessLogRecord } from '../types';

/**
 * Build a stable single-string access log message (REQ-002 / DEC-010).
 * Absent body sides render as `-`.
 */
export const formatHttpAccessLogMessage = (
  record: HttpAccessLogRecord,
): string => {
  const requestBody = record.requestBody ?? '-';
  const responseBody = record.responseBody ?? '-';
  return [
    `method=${record.method}`,
    `path=${record.path}`,
    `status=${record.status}`,
    `durationMs=${record.durationMs}`,
    `requestId=${record.requestId}`,
    `requestBody=${requestBody}`,
    `responseBody=${responseBody}`,
  ].join(' ');
};
