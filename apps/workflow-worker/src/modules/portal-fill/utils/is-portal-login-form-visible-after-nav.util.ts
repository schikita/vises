import type { PortalPage } from '../types';
import { isPortalLoginFormVisible } from './is-portal-login-form-visible.util';
import { isPortalNavigationContextDestroyedError } from './is-portal-navigation-context-destroyed-error.util';

/**
 * Login-form visibility probe that treats navigation context-destroyed evaluate
 * errors as still-on-login (do not claim login-gone during redirect).
 */
export const isPortalLoginFormVisibleAfterNav = async (
  page: PortalPage,
): Promise<boolean> => {
  try {
    return await isPortalLoginFormVisible(page);
  } catch (err) {
    if (isPortalNavigationContextDestroyedError(err)) {
      return true;
    }
    throw err;
  }
};
