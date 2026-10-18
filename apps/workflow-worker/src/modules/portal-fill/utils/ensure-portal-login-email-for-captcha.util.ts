import {
  PORTAL_LOGIN_EMAIL_CONTROL_NOT_FOUND_REASON,
  PORTAL_LOGIN_EMAIL_EMPTY_AFTER_REFILL_REASON,
} from '../constants';
import type {
  EnsurePortalLoginCredentialFieldOutcome,
  PortalPage,
} from '../types';
import { discoverLoginEmailControl } from './discover-login-email-control.util';
import { fillPortalLoginEmail } from './fill-portal-login-email.util';
import { isPortalLoginCredentialInputEmpty } from './is-portal-login-credential-input-empty.util';

/**
 * Ensure login email control is non-empty before captcha ensure/solve (DEC-005).
 * Discovers, reads `inputValue`, and refills via `fillPortalLoginEmail` when empty.
 */
export const ensurePortalLoginEmailForCaptcha = async (
  page: PortalPage,
  portalFormEmail: string,
): Promise<EnsurePortalLoginCredentialFieldOutcome> => {
  const discovered = await discoverLoginEmailControl(page);
  if (!discovered.ok || !discovered.cssSelector) {
    return {
      ok: false,
      reason: discovered.reason ?? PORTAL_LOGIN_EMAIL_CONTROL_NOT_FOUND_REASON,
    };
  }

  const count = await page.locator(discovered.cssSelector).count();
  if (count === 0) {
    return {
      ok: false,
      reason: PORTAL_LOGIN_EMAIL_CONTROL_NOT_FOUND_REASON,
    };
  }

  const current = await page.locator(discovered.cssSelector).first().inputValue();
  if (!isPortalLoginCredentialInputEmpty(current)) {
    return { ok: true, via: 'already_non_empty' };
  }

  const fill = await fillPortalLoginEmail(page, portalFormEmail);
  if (!fill.ok) {
    return {
      ok: false,
      reason: fill.reason ?? PORTAL_LOGIN_EMAIL_EMPTY_AFTER_REFILL_REASON,
    };
  }

  return { ok: true, via: 'refilled' };
};
