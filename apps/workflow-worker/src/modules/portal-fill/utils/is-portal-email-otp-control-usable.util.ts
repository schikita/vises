import { PORTAL_REGISTER_USER_SELECTORS } from '../constants';
import type { PortalPage } from '../types';

/**
 * True when `#EmailOtp` is present and enabled enough to accept entry
 * (DEC-002 soft-skip when Ok modal controls are absent).
 */
export const isPortalEmailOtpControlUsable = async (
  page: PortalPage,
): Promise<boolean> => {
  const selector = PORTAL_REGISTER_USER_SELECTORS.fields.EmailOtp;
  const count = await page.locator(selector).count();
  if (count === 0) {
    return false;
  }
  const loc = page.locator(selector).first();
  try {
    const visible = await loc.isVisible();
    if (!visible) {
      return false;
    }
    const disabled = await loc.isDisabled();
    return !disabled;
  } catch {
    return false;
  }
};
