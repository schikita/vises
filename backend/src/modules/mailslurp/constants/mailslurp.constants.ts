/**
 * MailSlurp API wait / OTP extraction patterns (vendor client only — DEC-001).
 * Portal OTP UI timings stay in portal-scrape.
 */

/** MailSlurp `waitForLatestEmail` timeout (DEC-010; aligns with common OTP examples). */
export const MAILSLURP_WAIT_FOR_EMAIL_MS = 120_000;

/**
 * Primary OTP pattern for MailSlurp Java-style content-match and JS body cue
 * (DEC-004). Capture group 1 = six digits.
 * Live sample cue: "Your email verification code is as mentioned below\n######"
 */
export const MAILSLURP_OTP_CONTENT_MATCH_PATTERN =
  '(?:email\\s+verification\\s+code|verification\\s+code|OTP|otp|Code|code|код|Код)[^0-9]{0,120}(\\d{6})';

/**
 * Fallback six-digit word-boundary pattern on email body when content-match
 * / cue yield nothing (DEC-004).
 */
export const MAILSLURP_OTP_BODY_FALLBACK_PATTERN = '\\b(\\d{6})\\b';
