import {
  PORTAL_OTP_OK_BUTTON_TEXTS,
  PORTAL_OTP_OK_MODAL_MS,
  PORTAL_OTP_OK_MODAL_ROOT_SELECTORS,
  PORTAL_OTP_OK_PREFERRED_SELECTORS,
} from '../constants';
import type { PortalOtpOkModalActionResult, PortalPage } from '../types';
import { otpOkModalActionInPage } from './otp-ok-modal-action-in-page.util';

/**
 * Wait (bounded) and dismiss the OTP Ok confirmation modal (REQ-006 / DEC-002).
 */
export const dismissPortalOtpOkModal = async (
  page: PortalPage,
): Promise<PortalOtpOkModalActionResult> => {
  const deadline = Date.now() + PORTAL_OTP_OK_MODAL_MS;
  const arg = {
    preferredSelectors: PORTAL_OTP_OK_PREFERRED_SELECTORS,
    modalRootSelectors: PORTAL_OTP_OK_MODAL_ROOT_SELECTORS,
    okButtonTexts: PORTAL_OTP_OK_BUTTON_TEXTS,
  };

  let lastError =
    'OTP Ok modal control not found within timeout';

  while (Date.now() < deadline) {
    const remaining = Math.max(0, deadline - Date.now());
    if (remaining <= 0) break;

    const result = await page.evaluate(otpOkModalActionInPage, arg);
    if (result.ok) {
      return result;
    }
    lastError = result.error;

    const sleepMs = Math.min(250, remaining);
    if (sleepMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, sleepMs));
    }
  }

  return { ok: false, error: lastError };
};
