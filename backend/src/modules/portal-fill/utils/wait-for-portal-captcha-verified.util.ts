import type { PortalPage } from '../types';
import { isPortalCaptchaVerified } from './is-portal-captcha-verified.util';
import { portalCaptchaVerifiedLoopSleep } from './portal-captcha-verified-loop-sleep.util';

/**
 * Poll until `#btnVerified` passes `isPortalCaptchaVerified`, or `timeoutMs` elapses (DEC-004).
 * Does not weaken the hidden-control predicate. Bounded by caller-supplied timeout.
 */
export const waitForPortalCaptchaVerified = async (
  page: PortalPage,
  timeoutMs: number,
  pollIntervalMs: number,
): Promise<boolean> => {
  if (timeoutMs <= 0) {
    return isPortalCaptchaVerified(page);
  }

  const deadlineAt = Date.now() + timeoutMs;

  while (Date.now() < deadlineAt) {
    if (await isPortalCaptchaVerified(page)) {
      return true;
    }
    const remainingMs = deadlineAt - Date.now();
    if (remainingMs <= 0) {
      break;
    }
    await portalCaptchaVerifiedLoopSleep(
      Math.min(pollIntervalMs, remainingMs),
    );
  }

  return isPortalCaptchaVerified(page);
};
