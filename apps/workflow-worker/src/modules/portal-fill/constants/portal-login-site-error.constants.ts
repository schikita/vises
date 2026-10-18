/**
 * Login site-processing failure selectors / cues / durable code
 * (portal-login-site-error DEC-002 / DEC-003 / DEC-006).
 * Named constants only — no helper functions.
 */

/** Danger alert root (query within document). */
export const PORTAL_LOGIN_SITE_ERROR_ALERT_SELECTOR = '.alert.alert-danger';

/** Captcha shell observed with processing alert (requester paste). */
export const PORTAL_LOGIN_SITE_ERROR_CAPTCHA_DIV_SELECTOR = '.captcha-div';

/** Inline captcha host still mounted on login captcha pages. */
export const PORTAL_LOGIN_SITE_ERROR_CAPTCHA_MAIN_DIV_SELECTOR =
  '#captcha-main-div';

/**
 * Message cues (OR, case-insensitive, whitespace-collapsed).
 * Includes portal typo `occured` and correctly spelled `occurred`.
 */
export const PORTAL_LOGIN_SITE_PROCESSING_MESSAGE_CUES = [
  'error occured while processing',
  'error occurred while processing',
  'please try again after sometime',
] as const;

/** Nest/portal log phase token (`phase=login_site_error`). */
export const PORTAL_LOGIN_SITE_ERROR_LOG_PHASE = 'login_site_error';

/**
 * Durable fill/client errorCode — identical string to
 * `BLS_LOGIN_SITE_PROCESSING_ERROR_CODE` (DEC-002 dual constant).
 */
export const PORTAL_LOGIN_SITE_PROCESSING_ERROR_CODE =
  'bls_login_site_processing';

/** Russian operator-facing message (DEC-002). */
export const PORTAL_LOGIN_SITE_PROCESSING_ERROR_MESSAGE =
  'Портал сообщил об ошибке обработки запроса при входе. Повторите попытку позже.';
