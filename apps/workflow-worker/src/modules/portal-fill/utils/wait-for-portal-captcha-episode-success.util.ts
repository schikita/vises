import type {
  PortalPage,
  WaitForPortalCaptchaEpisodeSuccessResult,
} from '../types';
import { detectPortalLoginSiteProcessingAlert } from './detect-portal-login-site-processing-alert.util';
import { isPortalCaptchaVerifiedAfterNav } from './is-portal-captcha-verified-after-nav.util';
import { isPortalLoginFormVisibleAfterNav } from './is-portal-login-form-visible-after-nav.util';
import { isPortalPasswordChangeFormVisibleAfterNav } from './is-portal-password-change-form-visible-after-nav.util';
import { portalCaptchaVerifiedLoopSleep } from './portal-captcha-verified-loop-sleep.util';
import { waitForPortalCaptchaVerified } from './wait-for-portal-captcha-verified.util';

/**
 * Wait for captcha episode success (portal-login-inline-captcha DEC-004 / SUB-004).
 * When `acceptLoginAuthSuccess` is false: `#btnVerified` only (register).
 * When true: `#btnVerified` **or** forced Change Password visible **or** login
 * form gone (login auth / form-progress / 010 DEC-001).
 * Site-processing alert blocks `login_auth` (portal-login-site-error DEC-004).
 * Login-auth probes use nav-safe evaluates (post-apply redirect race).
 */
export const waitForPortalCaptchaEpisodeSuccess = async (
  page: PortalPage,
  timeoutMs: number,
  pollIntervalMs: number,
  options?: { acceptLoginAuthSuccess?: boolean },
): Promise<WaitForPortalCaptchaEpisodeSuccessResult> => {
  const acceptLoginAuthSuccess = options?.acceptLoginAuthSuccess === true;

  if (!acceptLoginAuthSuccess) {
    const verified = await waitForPortalCaptchaVerified(
      page,
      timeoutMs,
      pollIntervalMs,
    );
    return verified
      ? { ok: true, via: 'btnVerified' }
      : { ok: false };
  }

  if (timeoutMs <= 0) {
    if (await isPortalCaptchaVerifiedAfterNav(page)) {
      return { ok: true, via: 'btnVerified' };
    }
    // Prefer password-change before login-gone so logs distinguish handoff.
    if (await isPortalPasswordChangeFormVisibleAfterNav(page)) {
      return { ok: true, via: 'password_change' };
    }
    if (!(await isPortalLoginFormVisibleAfterNav(page))) {
      const siteError = await detectPortalLoginSiteProcessingAlert(page);
      if (siteError.present) {
        return { ok: false };
      }
      return { ok: true, via: 'login_auth' };
    }
    return { ok: false };
  }

  const deadlineAt = Date.now() + timeoutMs;

  while (Date.now() < deadlineAt) {
    if (await isPortalCaptchaVerifiedAfterNav(page)) {
      return { ok: true, via: 'btnVerified' };
    }
    if (await isPortalPasswordChangeFormVisibleAfterNav(page)) {
      return { ok: true, via: 'password_change' };
    }
    if (!(await isPortalLoginFormVisibleAfterNav(page))) {
      const siteError = await detectPortalLoginSiteProcessingAlert(page);
      if (siteError.present) {
        // Alert shell: do not claim login_auth; end episode (DEC-004).
        return { ok: false };
      }
      return { ok: true, via: 'login_auth' };
    }
    const remainingMs = deadlineAt - Date.now();
    if (remainingMs <= 0) {
      break;
    }
    await portalCaptchaVerifiedLoopSleep(
      Math.min(pollIntervalMs, remainingMs),
    );
  }

  if (await isPortalCaptchaVerifiedAfterNav(page)) {
    return { ok: true, via: 'btnVerified' };
  }
  if (await isPortalPasswordChangeFormVisibleAfterNav(page)) {
    return { ok: true, via: 'password_change' };
  }
  if (!(await isPortalLoginFormVisibleAfterNav(page))) {
    const siteError = await detectPortalLoginSiteProcessingAlert(page);
    if (siteError.present) {
      return { ok: false };
    }
    return { ok: true, via: 'login_auth' };
  }
  return { ok: false };
};
