import {
  PORTAL_PASSWORD_CHANGE_POLL_MS,
  PORTAL_PASSWORD_CHANGE_VERIFY_WAIT_MS,
} from '../constants';
import type { PortalPage, PortalPasswordChangeVerifyResult } from '../types';
import { isPortalPasswordChangeFormVisibleForVerifyAfterNav } from './is-portal-password-change-form-visible-for-verify-after-nav.util';

/**
 * Verify password change left the forced-change form (REQ-012).
 * Success = change-form cues gone after submit on a live page context.
 * Mid-nav destroyed context is inconclusive (verify AfterNav returns true).
 */
export const verifyPortalPasswordChangeSuccess = async (
  page: PortalPage,
  options?: { waitMs?: number },
): Promise<PortalPasswordChangeVerifyResult> => {
  const waitMs = options?.waitMs ?? PORTAL_PASSWORD_CHANGE_VERIFY_WAIT_MS;
  const deadline = Date.now() + waitMs;

  while (Date.now() < deadline) {
    const stillChange =
      await isPortalPasswordChangeFormVisibleForVerifyAfterNav(page);
    if (!stillChange) {
      return { ok: true, via: 'change_form_absent' };
    }
    await new Promise((resolve) =>
      setTimeout(resolve, PORTAL_PASSWORD_CHANGE_POLL_MS),
    );
  }

  const stillChange =
    await isPortalPasswordChangeFormVisibleForVerifyAfterNav(page);
  if (!stillChange) {
    return { ok: true, via: 'change_form_absent' };
  }

  return {
    ok: false,
    reason: `password change form still visible after ${waitMs}ms`,
  };
};
