import {
  MAILTM_PORTAL_PASSWORD_BODY_FALLBACK_PATTERN,
  MAILTM_PORTAL_PASSWORD_CUE_PATTERN,
} from '../constants';
import type {
  ExtractTemporaryEmailPortalPasswordInput,
  ExtractTemporaryEmailPortalPasswordResult,
} from '../types';

/**
 * Extract the 6-digit portal login password from a temporary-email body.
 * Password cue first, then word-boundary fallback. Never logs body or password.
 */
export const extractMailTmPortalPassword = (
  input: ExtractTemporaryEmailPortalPasswordInput,
): ExtractTemporaryEmailPortalPasswordResult => {
  const body = input.body ?? '';
  if (body.length === 0) {
    return {
      ok: false,
      reason: 'Portal password not found in Mail.tm message (empty body)',
    };
  }

  const cue = body.match(new RegExp(MAILTM_PORTAL_PASSWORD_CUE_PATTERN, 'i'));
  const cuePassword = cue?.[1]?.trim();
  if (cuePassword && /^\d{6}$/.test(cuePassword)) {
    return { ok: true, password: cuePassword, source: 'cue' };
  }

  const fallback = body.match(
    new RegExp(MAILTM_PORTAL_PASSWORD_BODY_FALLBACK_PATTERN),
  );
  const fallbackPassword = fallback?.[1]?.trim();
  if (fallbackPassword && /^\d{6}$/.test(fallbackPassword)) {
    return { ok: true, password: fallbackPassword, source: 'body-fallback' };
  }

  return {
    ok: false,
    reason: 'Portal password not found in Mail.tm message content',
  };
};
