import {
  PORTAL_LOGIN_AUTH_POLL_MS,
  PORTAL_LOGIN_PASSWORD_WAIT_MS,
} from '../constants';
import type { PortalPage } from '../types';
import { discoverLoginPasswordControl } from './discover-login-password-control.util';

/**
 * Wait until a decoy-aware Password control is discoverable after email verify.
 */
export const waitForPortalLoginPasswordControl = async (
  page: PortalPage,
  options?: { waitMs?: number },
): Promise<{ ok: boolean; cssSelector?: string; reason?: string }> => {
  const waitMs = options?.waitMs ?? PORTAL_LOGIN_PASSWORD_WAIT_MS;
  const deadline = Date.now() + waitMs;
  let lastReason = 'password control not found';

  while (Date.now() < deadline) {
    const discovered = await discoverLoginPasswordControl(page);
    if (discovered.ok && discovered.cssSelector) {
      return { ok: true, cssSelector: discovered.cssSelector };
    }
    lastReason = discovered.reason ?? lastReason;
    await new Promise((resolve) =>
      setTimeout(resolve, PORTAL_LOGIN_AUTH_POLL_MS),
    );
  }

  return {
    ok: false,
    reason: `${lastReason} within ${waitMs}ms`,
  };
};
