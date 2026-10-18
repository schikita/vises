import { randomUUID } from 'node:crypto';

/**
 * Resolve access-log request id from inbound `x-request-id` or generate UUID v4
 * (REQ-008 / DEC-004 / DEC-008). Whitespace-only is treated as missing.
 */
export const resolveHttpRequestId = (
  headerValue: string | string[] | undefined,
): string => {
  const raw = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  if (trimmed.length > 0) {
    return trimmed;
  }
  return randomUUID();
};
