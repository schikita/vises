/**
 * Temporary-email wait / OTP extraction constants (tempmail_plus / browser-mail).
 */

/** Email wait budget for OTP / portal-password messages. */
export const TEMPORARY_EMAIL_WAIT_FOR_EMAIL_MS = 120_000;

/** Steady poll interval while waiting for a message. */
export const TEMPORARY_EMAIL_POLL_INTERVAL_MS = 2_000;

/**
 * Primary OTP cue pattern (capture group 1 = six digits).
 * Cue-then-fallback extraction on message body.
 */
export const TEMPORARY_EMAIL_OTP_CUE_PATTERN =
  '(?:email\\s+verification\\s+code|verification\\s+code|OTP|otp|Code|code|код|Код)[^0-9]{0,120}(\\d{6})';

/**
 * Fallback six-digit word-boundary pattern when cue yields nothing.
 */
export const TEMPORARY_EMAIL_OTP_BODY_FALLBACK_PATTERN = '\\b(\\d{6})\\b';

/**
 * Cue for the post-registration portal login password email (6 digits).
 * Distinct from EmailOtp verification cues.
 */
export const TEMPORARY_EMAIL_PORTAL_PASSWORD_CUE_PATTERN =
  '(?:temporary\\s+password|your\\s+password|login\\s+password|password|пароль|Пароль|временный\\s+пароль)[^0-9]{0,120}(\\d{6})';

/**
 * Fallback six-digit word-boundary for portal password email bodies.
 * Same shape as OTP fallback; callers must exclude the OTP message id.
 */
export const TEMPORARY_EMAIL_PORTAL_PASSWORD_BODY_FALLBACK_PATTERN = '\\b(\\d{6})\\b';
