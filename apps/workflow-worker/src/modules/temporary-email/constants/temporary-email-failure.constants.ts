/**
 * temporary email transient / permanent HTTP classification tables (DEC-005).
 */

/** HTTP statuses treated as transient (may open CB after consecutive whole-call outcomes). */
export const TEMPORARY_EMAIL_TRANSIENT_HTTP_STATUSES = [
  408, 425, 429, 500, 502, 503, 504,
] as const;

/**
 * Explicit 4xx statuses that are permanent (others in 400–499 also permanent
 * unless listed in {@link TEMPORARY_EMAIL_TRANSIENT_HTTP_STATUSES}).
 */
export const TEMPORARY_EMAIL_PERMANENT_HTTP_STATUSES = [
  400, 401, 403, 404,
] as const;

export const TEMPORARY_EMAIL_CLIENT_ERROR_NAME = 'TemporaryEmailClientError' as const;
