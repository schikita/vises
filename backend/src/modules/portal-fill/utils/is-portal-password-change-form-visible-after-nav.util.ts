import type { PortalPage } from '../types';
import { isPortalNavigationContextDestroyedError } from './is-portal-navigation-context-destroyed-error.util';
import { isPortalPasswordChangeFormVisible } from './is-portal-password-change-form-visible.util';

/**
 * Change Password visibility probe that treats navigation context-destroyed
 * evaluate errors as "not visible yet" (post-captcha redirect race).
 */
export const isPortalPasswordChangeFormVisibleAfterNav = async (
  page: PortalPage,
): Promise<boolean> => {
  try {
    return await isPortalPasswordChangeFormVisible(page);
  } catch (err) {
    if (isPortalNavigationContextDestroyedError(err)) {
      return false;
    }
    throw err;
  }
};
