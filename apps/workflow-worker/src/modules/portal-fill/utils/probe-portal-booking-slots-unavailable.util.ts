import {
  PORTAL_BOOKING_POLL_MS,
  PORTAL_BOOKING_SLOTS_PROBE_MS,
} from '../constants';
import type { PortalPage } from '../types';
import { isPortalBookingSlotsUnavailableVisible } from './is-portal-booking-slots-unavailable-visible.util';

/**
 * After captcha (or whenever DOM may show slots miss), poll for the exact
 * slots-unavailable banner. Returns present/absent — never fails solely
 * because the banner is missing (REQ-014 / VT-TASK-009).
 */
export const probePortalBookingSlotsUnavailable = async (
  page: PortalPage,
  options?: { timeoutMs?: number; pollMs?: number },
): Promise<{ present: boolean }> => {
  const timeoutMs = options?.timeoutMs ?? PORTAL_BOOKING_SLOTS_PROBE_MS;
  const pollMs = options?.pollMs ?? PORTAL_BOOKING_POLL_MS;
  const deadlineAt = Date.now() + timeoutMs;

  if (await isPortalBookingSlotsUnavailableVisible(page)) {
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
    if (await isPortalBookingSlotsUnavailableVisible(page)) {
      return { present: true };
    }
  }

  return { present: false };
};
