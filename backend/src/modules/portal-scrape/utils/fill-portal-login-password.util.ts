import type { PortalPage, WidgetOpResult } from '../types';
import { discoverLoginPasswordControl } from './discover-login-password-control.util';

/**
 * Fill the decoy-aware real login Password control (REQ-011).
 * Never logs the password value.
 */
export const fillPortalLoginPassword = async (
  page: PortalPage,
  portalPassword: string,
): Promise<WidgetOpResult> => {
  const discovered = await discoverLoginPasswordControl(page);
  if (!discovered.ok || !discovered.cssSelector) {
    return {
      ok: false,
      reason: discovered.reason ?? 'login Password control not found',
    };
  }

  const selector = discovered.cssSelector;
  const count = await page.locator(selector).count();
  if (count === 0) {
    return { ok: false, reason: `${selector} not found after discovery` };
  }

  const loc = page.locator(selector).first();
  await loc.fill(portalPassword);
  const read = await loc.inputValue();
  return {
    ok: read === portalPassword,
    via: 'fill',
    value: undefined,
    reason:
      read === portalPassword
        ? undefined
        : 'login Password read-back mismatch',
  };
};
