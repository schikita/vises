import {
  PORTAL_LOGIN_AUTH_POLL_MS,
  PORTAL_LOGIN_PASSWORD_WAIT_MS,
} from '../constants';
import type { PortalPage } from '../types';
import { discoverLoginPasswordControl } from './discover-login-password-control.util';
import { isPortalNavigationContextDestroyedError } from './is-portal-navigation-context-destroyed-error.util';

/**
 * Wait until a decoy-aware Password control is discoverable after email verify.
 * Navigation context-destroyed evaluate errors are transient poll misses (REQ-002).
 */
export const waitForPortalLoginPasswordControl = async (
  page: PortalPage,
  options?: { waitMs?: number },
): Promise<{ ok: boolean; cssSelector?: string; reason?: string }> => {
  const waitMs = options?.waitMs ?? PORTAL_LOGIN_PASSWORD_WAIT_MS;
  const deadline = Date.now() + waitMs;
  let lastReason = 'password control not found';

  while (Date.now() < deadline) {
    try {
      const discovered = await discoverLoginPasswordControl(page);
      if (discovered.ok && discovered.cssSelector) {
        return { ok: true, cssSelector: discovered.cssSelector };
      }
      lastReason = discovered.reason ?? lastReason;
    } catch (err) {
      if (isPortalNavigationContextDestroyedError(err)) {
        lastReason = 'navigation context destroyed (transient)';
      } else {
        throw err;
      }
    }
    await new Promise((resolve) =>
      setTimeout(resolve, PORTAL_LOGIN_AUTH_POLL_MS),
    );
  }

  return {
    ok: false,
    reason: `${lastReason} within ${waitMs}ms`,
  };
};
