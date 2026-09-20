/**
 * Mail.tm transient / permanent HTTP classification tables (DEC-005).
 */

/** HTTP statuses treated as transient (may open CB after consecutive whole-call outcomes). */
export const MAILTM_TRANSIENT_HTTP_STATUSES = [
  408, 425, 429, 500, 502, 503, 504,
] as const;

/**
 * Explicit 4xx statuses that are permanent (others in 400–499 also permanent
 * unless listed in {@link MAILTM_TRANSIENT_HTTP_STATUSES}).
 */
export const MAILTM_PERMANENT_HTTP_STATUSES = [
  400, 401, 403, 404,
] as const;

export const MAILTM_CLIENT_ERROR_NAME = 'MailTmClientError' as const;
