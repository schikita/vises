import {
  TEMPORARY_EMAIL_OTP_BODY_FALLBACK_PATTERN,
  TEMPORARY_EMAIL_OTP_CUE_PATTERN,
} from '../constants';
import type {
  ExtractTemporaryEmailOtpInput,
  ExtractTemporaryEmailOtpResult,
} from '../types';

/**
 * Extract a 6-digit OTP from a temporary-email message body.
 * Cue pattern first, then word-boundary fallback. Never logs body or OTP.
 */
export const extractTemporaryEmailOtp = (
  input: ExtractTemporaryEmailOtpInput,
): ExtractTemporaryEmailOtpResult => {
  const body = input.body ?? '';
  if (body.length === 0) {
    return {
      ok: false,
      reason: 'OTP code not found in temporary-email message (empty body)',
    };
  }

  const cue = body.match(new RegExp(TEMPORARY_EMAIL_OTP_CUE_PATTERN));
  const cueOtp = cue?.[1]?.trim();
  if (cueOtp && /^\d{6}$/.test(cueOtp)) {
    return { ok: true, otp: cueOtp, source: 'cue' };
  }

  const fallback = body.match(
    new RegExp(TEMPORARY_EMAIL_OTP_BODY_FALLBACK_PATTERN),
  );
  const fallbackOtp = fallback?.[1]?.trim();
  if (fallbackOtp && /^\d{6}$/.test(fallbackOtp)) {
    return { ok: true, otp: fallbackOtp, source: 'body-fallback' };
  }

  return {
    ok: false,
    reason: 'OTP code not found in temporary-email message content',
  };
};
