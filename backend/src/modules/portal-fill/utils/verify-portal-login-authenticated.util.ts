import {
  PORTAL_LOGIN_AUTH_POLL_MS,
  PORTAL_LOGIN_AUTH_WAIT_MS,
} from '../constants';
import type { PortalLoginAuthVerifyResult, PortalPage } from '../types';
import { isPortalLoginFormVisible } from './is-portal-login-form-visible.util';

/**
 * Verify login left the email/password UI (REQ-011).
 * Success = login form cues gone (authenticated landing / next portal page).
 */
export const verifyPortalLoginAuthenticated = async (
  page: PortalPage,
  options?: { waitMs?: number },
): Promise<PortalLoginAuthVerifyResult> => {
  const waitMs = options?.waitMs ?? PORTAL_LOGIN_AUTH_WAIT_MS;
  const deadline = Date.now() + waitMs;

  while (Date.now() < deadline) {
    const stillLogin = await isPortalLoginFormVisible(page);
    if (!stillLogin) {
      return { ok: true, via: 'login_form_absent' };
    }
    await new Promise((resolve) =>
      setTimeout(resolve, PORTAL_LOGIN_AUTH_POLL_MS),
    );
  }

  const stillLogin = await isPortalLoginFormVisible(page);
  if (!stillLogin) {
    return { ok: true, via: 'login_form_absent' };
  }

  return {
    ok: false,
    reason: `login form still visible after ${waitMs}ms`,
  };
};
