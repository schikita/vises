import {
  PORTAL_BOOKING_CAPTCHA_PROBE_MS,
  PORTAL_BOOKING_POLL_MS,
} from '../constants';
import type { PortalPage } from '../types';
import { isPortalBookingCaptchaSurfaceVisible } from './is-portal-booking-captcha-surface-visible.util';

/**
 * After VisaType Submit (or whenever DOM may show captcha), poll for the
 * booking captcha surface. Returns present/absent — never fails solely
 * because captcha is missing (REQ-013 / VT-TASK-008).
 */
export const probePortalBookingCaptchaSurface = async (
  page: PortalPage,
  options?: { timeoutMs?: number; pollMs?: number },
): Promise<{ present: boolean }> => {
  const timeoutMs = options?.timeoutMs ?? PORTAL_BOOKING_CAPTCHA_PROBE_MS;
  const pollMs = options?.pollMs ?? PORTAL_BOOKING_POLL_MS;
  const deadlineAt = Date.now() + timeoutMs;

  if (await isPortalBookingCaptchaSurfaceVisible(page)) {
    return { present: true };
  }

  while (Date.now() < deadlineAt) {
    const remainingMs = deadlineAt - Date.now();
    if (remainingMs <= 0) {
      break;
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, Math.min(pollMs, remainingMs));
    });
    if (await isPortalBookingCaptchaSurfaceVisible(page)) {
      return { present: true };
    }
  }

  return { present: false };
};
