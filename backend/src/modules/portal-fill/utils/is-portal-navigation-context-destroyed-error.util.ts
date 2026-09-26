import { PORTAL_NAVIGATION_CONTEXT_DESTROYED_ERROR_NEEDLE } from '../constants';

/**
 * True when Patchright/Playwright reports the page JS context was destroyed
 * because of a navigation (portal-login-prep-nav-race DEC-002 / REQ-002).
 */
export const isPortalNavigationContextDestroyedError = (
  error: unknown,
): boolean => {
  const message =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : String(error);
  return message
    .toLowerCase()
    .includes(PORTAL_NAVIGATION_CONTEXT_DESTROYED_ERROR_NEEDLE.toLowerCase());
};
