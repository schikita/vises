import { MailSlurp } from 'mailslurp-client';
import {
  MAILSLURP_OTP_BODY_FALLBACK_PATTERN,
  MAILSLURP_OTP_CONTENT_MATCH_PATTERN,
} from '../constants';
import type {
  ExtractMailSlurpOtpInput,
  ExtractMailSlurpOtpResult,
} from '../types';

/**
 * Extract a 6-digit OTP via MailSlurp content-match, then body cue/fallback
 * (REQ-008 / DEC-004). Does not log body or OTP (NFR-004).
 */
export const extractMailSlurpOtp = async (
  input: ExtractMailSlurpOtpInput,
): Promise<ExtractMailSlurpOtpResult> => {
  try {
    const client = new MailSlurp({ apiKey: input.apiKey });
    const matchResult = await client.emailController.getEmailContentMatch({
      emailId: input.emailId,
      contentMatchOptions: {
        pattern: MAILSLURP_OTP_CONTENT_MATCH_PATTERN,
      },
    });
    const fromContent = matchResult.matches?.[1]?.trim();
    if (fromContent && /^\d{6}$/.test(fromContent)) {
      return { ok: true, otp: fromContent, source: 'content-match' };
    }
  } catch {
    // Content-match failure falls through to local body patterns (DEC-004).
  }

  const body = input.body ?? '';
  if (body.length > 0) {
    const cue = body.match(new RegExp(MAILSLURP_OTP_CONTENT_MATCH_PATTERN));
    const cueOtp = cue?.[1]?.trim();
    if (cueOtp && /^\d{6}$/.test(cueOtp)) {
      return { ok: true, otp: cueOtp, source: 'body-fallback' };
    }
    const fallback = body.match(
      new RegExp(MAILSLURP_OTP_BODY_FALLBACK_PATTERN),
    );
    const fallbackOtp = fallback?.[1]?.trim();
    if (fallbackOtp && /^\d{6}$/.test(fallbackOtp)) {
      return { ok: true, otp: fallbackOtp, source: 'body-fallback' };
    }
  }

  return {
    ok: false,
    reason: 'OTP code not found in MailSlurp email content',
  };
};
