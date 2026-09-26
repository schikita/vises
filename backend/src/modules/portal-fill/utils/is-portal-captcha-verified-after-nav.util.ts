import type { PortalPage } from '../types';
import { isPortalCaptchaVerified } from './is-portal-captcha-verified.util';
import { isPortalNavigationContextDestroyedError } from './is-portal-navigation-context-destroyed-error.util';

/**
 * `#btnVerified` probe that treats navigation context-destroyed evaluate errors
 * as not-yet-verified (post-apply redirect race).
 */
export const isPortalCaptchaVerifiedAfterNav = async (
  page: PortalPage,
): Promise<boolean> => {
  try {
    return await isPortalCaptchaVerified(page);
  } catch (err) {
    if (isPortalNavigationContextDestroyedError(err)) {
      return false;
    }
    throw err;
  }
};
