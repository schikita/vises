/**
 * Browser temporary-email (tempmail.plus) constants (DEC-009 / REQ-009 / REQ-010).
 * Selectors reconciled against tempmail_site.html + live DOM.
 */

/** Hardcoded public site origin — no env override in v1 (DEC-009). */
export const BROWSER_MAIL_BASE_URL = 'https://tempmail.plus/';

/**
 * Fail-closed code when in-memory Patchright session is missing
 * (process restart / dispose / never created) — DEC-002 / REQ-011.
 * Non-secret; safe to log and surface in notes.
 */
export const BROWSER_MAIL_SESSION_MISSING_ERROR =
  'email_browser_session_missing';

/** Soft-skip detail when deleteAccount has no HTTP delete in browser mode. */
export const BROWSER_MAIL_DELETE_SOFT_SKIP =
  'browser_mail_delete_soft_skip';

/** Inbox poll interval while waiting for a letter (reuse Mail.tm-class budget). */
export const BROWSER_MAIL_POLL_INTERVAL_MS = 2_000;

/** Default navigation / action timeout for tempmail.plus page ops. */
export const BROWSER_MAIL_NAV_TIMEOUT_MS = 30_000;

/** DOM selectors for create + wait (REQ-009 / REQ-010). */
export const BROWSER_MAIL_SELECTOR = {
  PRE_BUTTON: '#pre_button',
  DOMAIN: '#domain',
  DOMAIN_DROPDOWN_ITEMS: '#pre_form .dropdown-menu .dropdown-item',
  LETTER: '#container-body .letter',
  /** Opened letter body region inside `.letter` (sheet `#info .overflow-auto`). */
  LETTER_BODY: '#container-body .letter #info .overflow-auto',
  LETTER_SUBJECT: '#container-body .letter #info .subject',
} as const;
