/**
 * CapMonster transient / permanent classification tables (DEC-001 / REQ-004).
 */

/** CapMonster JSON business `errorCode` values that are retryable. */
export const CAPMONSTER_TRANSIENT_ERROR_CODES = [
  'ERROR_NO_SLOT_AVAILABLE',
  'ERROR_TOO_MANY_REQUESTS',
] as const;

/**
 * CapMonster JSON business `errorCode` values that are non-retryable.
 * Unknown / missing codes with `errorId !== 0` also classify as permanent.
 */
export const CAPMONSTER_PERMANENT_ERROR_CODES = [
  'ERROR_KEY_DOES_NOT_EXIST',
  'ERROR_ZERO_BALANCE',
  'ERROR_KEY_DENIED',
  'ERROR_IP_NOT_ALLOWED',
  'ERROR_IP_BLOCKED',
  'ERROR_TASK_NOT_SUPPORTED',
  'ERROR_CAPTCHA_UNSOLVABLE',
] as const;

/** HTTP statuses treated as transient transport failures. */
export const CAPMONSTER_TRANSIENT_HTTP_STATUSES = [
  408, 425, 429, 500, 502, 503, 504,
] as const;

/**
 * Explicit 4xx statuses that are permanent (others in 400–499 also permanent
 * unless listed in {@link CAPMONSTER_TRANSIENT_HTTP_STATUSES}).
 */
export const CAPMONSTER_PERMANENT_HTTP_STATUSES = [
  400, 401, 403, 404,
] as const;

export const CAPMONSTER_CLIENT_ERROR_NAME = 'CapMonsterClientError' as const;
