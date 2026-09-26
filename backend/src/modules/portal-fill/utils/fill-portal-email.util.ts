import { PORTAL_REGISTER_USER_SELECTORS } from '../constants';
import type { PortalPage, WidgetOpResult } from '../types';

/**
 * Fill/ensure portal `#Email` with the disposable temporary-mailbox address
 * (REQ-002 / portal-registration-otp-flow). No-op when read-back already matches.
 * Does not log the address value in the return path beyond read-back mismatch.
 */
export const fillPortalEmail = async (
  page: PortalPage,
  address: string,
): Promise<WidgetOpResult> => {
  const selector = PORTAL_REGISTER_USER_SELECTORS.fields.Email;
  const count = await page.locator(selector).count();
  if (count === 0) {
    return { ok: false, reason: `${selector} not found` };
  }
  const loc = page.locator(selector).first();
  const current = await loc.inputValue();
  if (current === address) {
    return { ok: true, via: 'already_set' };
  }
  await loc.fill(address);
  const read = await loc.inputValue();
  return {
    ok: read === address,
    via: 'fill',
    value: read === address ? undefined : read,
    reason: read === address ? undefined : 'Email read-back mismatch',
  };
};
