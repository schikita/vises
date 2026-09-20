/**
 * Mail.tm REST client constants (paths / poll / OTP).
 * Attribution: https://mail.tm
 * Base URL comes from env `MAILTM_API_BASE_URL` (ConfigService), not here.
 */

export const MAILTM_DOMAINS_PATH = '/domains';
export const MAILTM_ACCOUNTS_PATH = '/accounts';
export const MAILTM_TOKEN_PATH = '/token';
export const MAILTM_MESSAGES_PATH = '/messages';

/** Vendor email wait budget. */
export const MAILTM_WAIT_FOR_EMAIL_MS = 120_000;

/** Steady poll interval while waiting for a message. */
export const MAILTM_POLL_INTERVAL_MS = 2_000;

/** Initial 429 backoff (ms); doubles each time, capped by MAILTM_BACKOFF_MAX_MS. */
export const MAILTM_BACKOFF_INITIAL_MS = 2_000;

/** Cap for exponential 429 backoff (ms). */
export const MAILTM_BACKOFF_MAX_MS = 16_000;

/**
 * Primary OTP cue pattern (capture group 1 = six digits).
 * Cue-then-fallback extraction on message body.
 */
export const MAILTM_OTP_CUE_PATTERN =
  '(?:email\\s+verification\\s+code|verification\\s+code|OTP|otp|Code|code|код|Код)[^0-9]{0,120}(\\d{6})';

/**
 * Fallback six-digit word-boundary pattern when cue yields nothing.
 */
export const MAILTM_OTP_BODY_FALLBACK_PATTERN = '\\b(\\d{6})\\b';
