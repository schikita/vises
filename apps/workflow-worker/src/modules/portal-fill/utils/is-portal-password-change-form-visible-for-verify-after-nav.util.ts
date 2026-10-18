import { Logger } from '@nestjs/common';
import type { PortalPage } from '../types';
import { isPortalNavigationContextDestroyedError } from './is-portal-navigation-context-destroyed-error.util';
import { isPortalPasswordChangeFormVisible } from './is-portal-password-change-form-visible.util';

const logger = new Logger(
  'isPortalPasswordChangeFormVisibleForVerifyAfterNav',
);

/**
 * Post-submit verify polarity (DEC-002): destroyed execution context ⇒ `true`
 * (inconclusive / still-waiting — keep polling). Do NOT use landing AfterNav
 * (`isPortalPasswordChangeFormVisibleAfterNav`), which returns `false` on
 * destroy for captcha "not visible yet" detection.
 */
export const isPortalPasswordChangeFormVisibleForVerifyAfterNav = async (
  page: PortalPage,
): Promise<boolean> => {
  try {
    return await isPortalPasswordChangeFormVisible(page);
  } catch (err) {
    if (isPortalNavigationContextDestroyedError(err)) {
      logger.log(
        'phase=verify soft_continue navigation_context_destroyed (inconclusive/still-waiting)',
      );
      return true;
    }
    throw err;
  }
};
