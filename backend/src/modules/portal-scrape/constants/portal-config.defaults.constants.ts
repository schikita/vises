export const DEFAULT_REGISTER_PATH = '/Global/Account/RegisterUser';

/** Patchright navigation / default action timeout (ms). */
export const PORTAL_NAV_TIMEOUT_MS = 30_000;

/**
 * When true, skip CAPTCHA/anti-bot page abort (operator-owned CAPTCHA).
 * Fixed false — live autofill always runs the guard unless CapMonster is on.
 */
export const PORTAL_SKIP_CAPTCHA_GUARD = false;

/** Keep browser open after fill/verify (ms). Fixed 0 — close immediately. */
export const PORTAL_KEEP_OPEN_MS = 0;
