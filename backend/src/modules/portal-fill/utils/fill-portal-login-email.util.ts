import type { PortalPage, WidgetOpResult } from '../types';
import { discoverLoginEmailControl } from './discover-login-email-control.util';

/**
 * Fill the decoy-aware real login Email control with the portal-form email
 * (REQ-010 / REQ-011 / DEC-010). Does not touch CRM clientEmail or hidden tokens.
 */
export const fillPortalLoginEmail = async (
  page: PortalPage,
  portalFormEmail: string,
): Promise<WidgetOpResult> => {
  const discovered = await discoverLoginEmailControl(page);
  if (!discovered.ok || !discovered.cssSelector) {
    return {
      ok: false,
      reason: discovered.reason ?? 'login Email control not found',
    };
  }

  const selector = discovered.cssSelector;
  const count = await page.locator(selector).count();
  if (count === 0) {
    return { ok: false, reason: `${selector} not found after discovery` };
  }

  const loc = page.locator(selector).first();
  await loc.fill(portalFormEmail);
  const read = await loc.inputValue();
  return {
    ok: read === portalFormEmail,
    via: 'fill',
    value: read === portalFormEmail ? undefined : read,
    reason:
      read === portalFormEmail
        ? undefined
        : 'login Email read-back mismatch',
  };
};
