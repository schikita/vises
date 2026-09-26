export const DEFAULT_REGISTER_PATH = '/Global/Account/RegisterUser';

/**
 * Sample / fallback login path casing (DEC-009). Used only when env key is
 * absent/undefined — empty/whitespace still fails closed at URL resolve.
 */
export const DEFAULT_LOGIN_PATH = '/Global/account/login';

/** Default path to Manage Applicants (fixture nav: Manage Applicants). */
export const DEFAULT_MANAGE_APPLICANTS_PATH =
  '/Global/appointmentdata/myappointments';

/** Patchright navigation / default action timeout (ms). */
export const PORTAL_NAV_TIMEOUT_MS = 30_000;

/**
 * Max wait for `chromium.launch` to return a ready browser (ms).
 * Independent of page navigation timeouts after the browser is open.
 */
export const PORTAL_BROWSER_LAUNCH_TIMEOUT_MS = 60_000;

/**
 * When true, skip CAPTCHA/anti-bot page abort (operator-owned CAPTCHA).
 * Fixed false — live autofill always runs the guard unless captcha service is on.
 */
export const PORTAL_SKIP_CAPTCHA_GUARD = false;

/** Keep browser open after fill/verify (ms). Fixed 0 — close immediately. */
export const PORTAL_KEEP_OPEN_MS = 0;
