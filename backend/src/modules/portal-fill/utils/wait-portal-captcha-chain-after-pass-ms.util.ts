import { PORTAL_CAPTCHA_VERIFIED_AFTER_APPLY_POLL_MS } from '../constants';
import type {
  PortalPage,
  WaitPortalCaptchaChainAfterPassMsResult,
} from '../types';
import { isPortalFillAbortRequested } from './is-portal-fill-abort-requested.util';
import { isPortalPasswordChangeFormVisibleAfterNav } from './is-portal-password-change-form-visible-after-nav.util';
import { portalCaptchaVerifiedLoopSleep } from './portal-captcha-verified-loop-sleep.util';

/**
 * Abort-aware post-pass wait that polls for forced Change Password visibility
 * (010 DEC-002). Total wait remains capped at `waitMs` when the form is absent.
 * Navigation context-destroyed evaluates are transient poll misses (post-apply
 * redirect to Change Password).
 */
export const waitPortalCaptchaChainAfterPassMs = async (
  page: PortalPage,
  waitMs: number,
  options: {
    remainingMs: () => number;
    abortSignal?: AbortSignal;
    pollIntervalMs?: number;
  },
): Promise<WaitPortalCaptchaChainAfterPassMsResult> => {
  if (waitMs <= 0) {
    return 'elapsed';
  }

  const pollIntervalMs =
    options.pollIntervalMs ?? PORTAL_CAPTCHA_VERIFIED_AFTER_APPLY_POLL_MS;
  const deadlineAt = Date.now() + waitMs;

  while (Date.now() < deadlineAt) {
    if (isPortalFillAbortRequested(options.abortSignal)) {
      return 'aborted';
    }
    if (options.remainingMs() <= 0) {
      return 'budget_exhausted';
    }
    if (await isPortalPasswordChangeFormVisibleAfterNav(page)) {
      return 'password_change_landing';
    }

    const remainingWaitMs = deadlineAt - Date.now();
    if (remainingWaitMs <= 0) {
      break;
    }
    await portalCaptchaVerifiedLoopSleep(
      Math.min(pollIntervalMs, remainingWaitMs),
    );
  }

  if (isPortalFillAbortRequested(options.abortSignal)) {
    return 'aborted';
  }
  if (options.remainingMs() <= 0) {
    return 'budget_exhausted';
  }
  if (await isPortalPasswordChangeFormVisibleAfterNav(page)) {
    return 'password_change_landing';
  }
  return 'elapsed';
};
