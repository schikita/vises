import { PORTAL_REGISTER_USER_SELECTORS } from '../constants';
import type { PortalPage, WidgetOpResult } from '../types';

/**
 * Fill `#EmailOtp` with the extracted OTP code (REQ-008). Does not log the OTP.
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
  await loc.fill(otp);
  const read = await loc.inputValue();
  return {
    ok: read === otp,
    via: 'fill',
    value: read === otp ? undefined : read,
    reason: read === otp ? undefined : 'EmailOtp read-back mismatch',
  };
};
