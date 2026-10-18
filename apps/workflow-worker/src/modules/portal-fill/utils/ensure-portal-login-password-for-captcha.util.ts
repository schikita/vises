import {
  PORTAL_LOGIN_PASSWORD_CONTROL_NOT_FOUND_REASON,
  PORTAL_LOGIN_PASSWORD_EMPTY_AFTER_REFILL_REASON,
} from '../constants';
import type {
  EnsurePortalLoginCredentialFieldOutcome,
  PortalPage,
} from '../types';
import { discoverLoginPasswordControl } from './discover-login-password-control.util';
import { fillPortalLoginPassword } from './fill-portal-login-password.util';
import { isPortalLoginCredentialInputEmpty } from './is-portal-login-credential-input-empty.util';

/**
 * Ensure login password control is non-empty before captcha ensure/solve (DEC-005).
 * Never logs password or read-back values (REQ-008 / NFR-003).
 */
export const ensurePortalLoginPasswordForCaptcha = async (
  page: PortalPage,
  portalPassword: string,
): Promise<EnsurePortalLoginCredentialFieldOutcome> => {
  const discovered = await discoverLoginPasswordControl(page);
  if (!discovered.ok || !discovered.cssSelector) {
    return {
      ok: false,
      reason:
        discovered.reason ?? PORTAL_LOGIN_PASSWORD_CONTROL_NOT_FOUND_REASON,
    };
  }

  const count = await page.locator(discovered.cssSelector).count();
  if (count === 0) {
    return {
      ok: false,
      reason: PORTAL_LOGIN_PASSWORD_CONTROL_NOT_FOUND_REASON,
    };
  }

  const current = await page.locator(discovered.cssSelector).first().inputValue();
  if (!isPortalLoginCredentialInputEmpty(current)) {
    return { ok: true, via: 'already_non_empty' };
  }

  const fill = await fillPortalLoginPassword(page, portalPassword);
  if (!fill.ok) {
    return {
      ok: false,
      reason: fill.reason ?? PORTAL_LOGIN_PASSWORD_EMPTY_AFTER_REFILL_REASON,
    };
  }

  return { ok: true, via: 'refilled' };
};
