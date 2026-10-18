import {
  PORTAL_LOGIN_AUTH_POLL_MS,
  PORTAL_LOGIN_AUTH_WAIT_MS,
} from '../constants';
import type { PortalLoginAuthVerifyResult, PortalPage } from '../types';
import { detectPortalLoginSiteProcessingAlert } from './detect-portal-login-site-processing-alert.util';
import { isPortalLoginFormVisibleAfterNav } from './is-portal-login-form-visible-after-nav.util';
import { settlePortalPageAfterLoginVerify } from './settle-portal-page-after-login-verify.util';

/**
 * Verify login left the email/password UI (REQ-011).
 * Settle once (DEC-001), then each poll: site-processing alert ⇒ fail
 * (DEC-004); form absent without alert ⇒ success (CON-005).
 */
export const verifyPortalLoginAuthenticated = async (
  page: PortalPage,
  options?: { waitMs?: number },
): Promise<PortalLoginAuthVerifyResult> => {
  const waitMs = options?.waitMs ?? PORTAL_LOGIN_AUTH_WAIT_MS;
  const deadline = Date.now() + waitMs;

  await settlePortalPageAfterLoginVerify(page);

  while (Date.now() < deadline) {
    const siteError = await detectPortalLoginSiteProcessingAlert(page);
    if (siteError.present) {
      return {
        ok: false,
        via: 'site_processing_error',
        reason: 'portal site-processing alert present',
        alertText: siteError.alertText,
      };
    }
    const stillLogin = await isPortalLoginFormVisibleAfterNav(page);
    if (!stillLogin) {
      return { ok: true, via: 'login_form_absent' };
    }
    await new Promise((resolve) =>
      setTimeout(resolve, PORTAL_LOGIN_AUTH_POLL_MS),
    );
  }

  const siteErrorFinal = await detectPortalLoginSiteProcessingAlert(page);
  if (siteErrorFinal.present) {
    return {
      ok: false,
      via: 'site_processing_error',
      reason: 'portal site-processing alert present',
      alertText: siteErrorFinal.alertText,
    };
  }

  const stillLogin = await isPortalLoginFormVisibleAfterNav(page);
  if (!stillLogin) {
    return { ok: true, via: 'login_form_absent' };
  }

  return {
    ok: false,
    reason: `login form still visible after ${waitMs}ms`,
  };
};
