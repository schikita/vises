/**
 * Non-secret tokens for login credential ensure before captcha solve
 * (portal-captcha-credential-refill REQ-008 / REQ-009 / DEC-001).
 * Reasons must never embed credential values.
 */

export const PORTAL_LOGIN_CREDENTIALS_ENSURE_PHASE =
  'login_credentials_ensure';

export const PORTAL_LOGIN_EMAIL_CONTROL_NOT_FOUND_REASON =
  'login email control not found';

export const PORTAL_LOGIN_PASSWORD_CONTROL_NOT_FOUND_REASON =
  'login password control not found';

export const PORTAL_LOGIN_EMAIL_EMPTY_AFTER_REFILL_REASON =
  'login email empty after refill';

export const PORTAL_LOGIN_PASSWORD_EMPTY_AFTER_REFILL_REASON =
  'login password empty after refill';

export const PORTAL_LOGIN_CREDENTIALS_ENSURE_FAILED_REASON =
  'login credentials ensure failed';
