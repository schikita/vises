import type { PortalPage } from '../types';
import { isPortalBookingCaptchaSurfaceVisible } from './is-portal-booking-captcha-surface-visible.util';
import { portalCaptchaVerifiedLoopSleep } from './portal-captcha-verified-loop-sleep.util';

/**
 * Poll until booking captcha surface is gone (`#captcha-main-div` /
 * `.captcha-div` / `.main-div-container` + `#btnVerify` path), or timeout.
 * Booking materials document only `#btnVerify` — success is dismiss / next
 * page, not `#btnVerified` (REQ-013 / VT-TASK-008).
 */
export const waitForPortalBookingCaptchaSurfaceDismissed = async (
  page: PortalPage,
  timeoutMs: number,
  pollIntervalMs: number,
): Promise<boolean> => {
  if (timeoutMs <= 0) {
    return !(await isPortalBookingCaptchaSurfaceVisible(page));
  }

  const deadlineAt = Date.now() + timeoutMs;

  while (Date.now() < deadlineAt) {
    if (!(await isPortalBookingCaptchaSurfaceVisible(page))) {
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

  return !(await isPortalBookingCaptchaSurfaceVisible(page));
};
