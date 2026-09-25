/**
 * Probe-only same-kind BLS 3×3 challenge presence (capmonster-chained-captcha DEC-004).
 * Does **not** adaptive-click `#btnVerify` on miss — absent ends the chain.
 */
import { PORTAL_CAPTCHA_CHALLENGE_READY_PROBE_MS } from '../constants';
import type { PortalPage } from '../types';
import { isPortalCaptchaChallengeAbsentError } from './is-portal-captcha-challenge-absent-error.util';
import { resolveCaptchaFrame } from './portal-captcha-frame.util';

export const isPortalCaptchaSameKindChallengePresent = async (
  page: PortalPage,
  options?: { waitTimeoutMs?: number },
): Promise<boolean> => {
  const remainingCap =
    options?.waitTimeoutMs ?? PORTAL_CAPTCHA_CHALLENGE_READY_PROBE_MS;
  const probeMs = Math.min(PORTAL_CAPTCHA_CHALLENGE_READY_PROBE_MS, remainingCap);

  if (probeMs <= 0) {
    return false;
  }

  try {
    await resolveCaptchaFrame(page, { waitTimeoutMs: probeMs });
    return true;
  } catch (err) {
    if (isPortalCaptchaChallengeAbsentError(err)) {
      return false;
    }
    throw err;
  }
};
