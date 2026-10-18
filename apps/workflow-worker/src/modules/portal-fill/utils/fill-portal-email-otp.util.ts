import {
  PORTAL_OTP_KEYBOARD_DELAY_MS,
  PORTAL_REGISTER_USER_SELECTORS,
} from '../constants';
import type { PortalPage, WidgetOpResult } from '../types';

/**
 * Enter OTP into `#EmailOtp` via keyboard/`pressSequentially` (REQ-004 / DEC-006).
 * Does not log the OTP. Paste-only `fill` is not the sole entry method.
 */
export const fillPortalEmailOtp = async (
  page: PortalPage,
  otp: string,
): Promise<WidgetOpResult> => {
  const selector = PORTAL_REGISTER_USER_SELECTORS.fields.EmailOtp;
  const count = await page.locator(selector).count();
  if (count === 0) {
    return { ok: false, reason: `${selector} not found` };
  }
  const loc = page.locator(selector).first();
  await loc.click({ timeout: 5_000 });
  await loc.fill('');
  await loc.pressSequentially(otp, { delay: PORTAL_OTP_KEYBOARD_DELAY_MS });
  const read = await loc.inputValue();
  return {
    ok: read === otp,
    via: 'keyboard',
    value: read === otp ? undefined : read,
    reason: read === otp ? undefined : 'EmailOtp read-back mismatch',
  };
};
