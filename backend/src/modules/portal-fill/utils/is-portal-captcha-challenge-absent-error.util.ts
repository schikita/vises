import { PORTAL_CAPTCHA_DUAL_SURFACE_ABSENT_ERROR } from '../constants';

/**
 * True when frame/challenge is missing (adaptive `#btnVerify` trigger /
 * chain end-chain). Decoy/extract mismatches are not absent — those consume
 * outer budget only.
 *
 * Includes dual-surface “neither ready” (portal-login-inline-captcha DEC-008)
 * plus legacy iframe-only needles.
 */
export const isPortalCaptchaChallengeAbsentError = (err: unknown): boolean => {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes(PORTAL_CAPTCHA_DUAL_SURFACE_ABSENT_ERROR) ||
    msg.includes('CAPTCHA iframe not attached') ||
    msg.includes('CAPTCHA iframe frame/content not ready') ||
    msg.includes('CAPTCHA challenge root not visible')
  );
};
