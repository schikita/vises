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

/**
 * Fail-closed code when Patchright browser/page closed mid-wait (DEC-004).
 * Non-secret; treated like session-missing for Resend eligibility.
 */
export const BROWSER_MAIL_SESSION_CLOSED_ERROR =
  'browser_mail_session_closed';

/**
 * ~1 s pace between browser-mail UI actions (REQ-008 / DEC-008).
 * Also used as inbox poll gap.
 */
export const BROWSER_MAIL_UI_PACE_MS = 1_000;

/** Inbox poll interval while waiting for a letter (DEC-008: matches UI pace). */
export const BROWSER_MAIL_POLL_INTERVAL_MS = BROWSER_MAIL_UI_PACE_MS;

/** Default navigation / action timeout for tempmail.plus page ops. */
export const BROWSER_MAIL_NAV_TIMEOUT_MS = 30_000;

/** Max wait for `chromium.launch` to return a ready browser (ms). */
export const BROWSER_MAIL_LAUNCH_TIMEOUT_MS = 60_000;

/**
 * DOM selectors for create + inbox wait (REQ-009 / REQ-010 / REQ-013).
 * Targets tempmail.plus list / letter chrome (operator DOM); no HTML fixture required.
 */
export const BROWSER_MAIL_SELECTOR = {
  PRE_BUTTON: '#pre_button',
  DOMAIN: '#domain',
  DOMAIN_DROPDOWN_ITEMS: '#pre_form .dropdown-menu .dropdown-item',
  /** Inbox list container (`div.inbox` → child `div.mail` rows). */
  INBOX: 'div.inbox',
  /** Mail rows in the list UI (not the opened letter view). */
  MAIL_ROW: 'div.inbox div.mail',
  /** Opened message container after clicking a mail row. */
  LETTER: '#container-body .letter',
  /** Letter info root — body via lastElementChild then overflow cascade (DEC-002). */
  LETTER_INFO: 'div#info',
  /** Cascade step 2: overflow body inside `#info`. */
  LETTER_INFO_OVERFLOW: 'div#info .overflow-auto',
  /** Cascade step 3 / legacy: overflow body inside `.letter`. */
  LETTER_BODY: '#container-body .letter #info .overflow-auto',
  LETTER_SUBJECT: '#container-body .letter #info .subject',
  /** Return from letter view to inbox list (REQ-008 / DEC-005). */
  BACK: 'button#back',
} as const;
