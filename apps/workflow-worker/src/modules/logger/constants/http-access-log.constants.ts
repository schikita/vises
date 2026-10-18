/** Nest logger context for HTTP access lines (REQ-011 / DEC-010). */
export const HTTP_ACCESS_LOG_CONTEXT = 'HTTP';

/** Max serialized characters per body side (REQ-006). */
export const HTTP_ACCESS_LOG_BODY_MAX_CHARS = 2048;

/** Replacement for denylisted object field values (REQ-005). */
export const HTTP_ACCESS_LOG_REDACTION_MARKER = '[REDACTED]';

/** Placeholder when multipart/binary bodies are omitted (REQ-003 / DEC-002). */
export const HTTP_ACCESS_LOG_BODY_OMISSION_MARKER =
  '[omitted: multipart/binary]';

/** Appended when a body summary is cut to the max length (REQ-006). */
export const HTTP_ACCESS_LOG_TRUNCATION_MARKER = '...[truncated]';

/**
 * Object keys redacted case-insensitively (REQ-005 / DEC-006).
 * Authorization headers are not logged in v1; key remains for body fields.
 */
export const HTTP_ACCESS_LOG_SENSITIVE_FIELD_KEYS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'authorization',
] as const;

/** Inbound request-id header (Express lowercases header names). */
export const HTTP_ACCESS_REQUEST_ID_HEADER = 'x-request-id';

/** Echoed response header (DEC-004). */
export const HTTP_ACCESS_REQUEST_ID_RESPONSE_HEADER = 'X-Request-Id';
