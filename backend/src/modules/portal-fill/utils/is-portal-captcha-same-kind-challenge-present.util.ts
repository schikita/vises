/**
 * Probe-only same-kind BLS 3×3 challenge presence (capmonster-chained-captcha DEC-004).
 * Dual-surface: iframe GenerateCaptcha **or** inline main-frame (REQ-009).
 * Does **not** adaptive-click `#btnVerify` on miss — absent ends the chain.
 */
import { PORTAL_CAPTCHA_CHALLENGE_READY_PROBE_MS } from '../constants';
import type { PortalPage } from '../types';
import { isPortalCaptchaChallengeAbsentError } from './is-portal-captcha-challenge-absent-error.util';
import { resolvePortalCaptchaChallengeContext } from './resolve-portal-captcha-challenge-context.util';

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
    await resolvePortalCaptchaChallengeContext(page, {
      waitTimeoutMs: probeMs,
    });
    return true;
  } catch (err) {
    if (isPortalCaptchaChallengeAbsentError(err)) {
      return false;
    }
    throw err;
  }
};
