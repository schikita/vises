import {
  PORTAL_CAPTCHA_INLINE_CONFIRM_CONTROL,
  PORTAL_CAPTCHA_SELECTORS,
  type PortalCaptchaSelectorSet,
} from '../constants';
import type { PortalCaptchaSurfaceKind } from '../types';

/**
 * Clone base captcha selectors with surface-appropriate confirm control
 * (portal-login-inline-captcha DEC-005 / SUB-002).
 * iframe → `#submit`; inline → `#btnVerify`.
 */
export const buildPortalCaptchaSurfaceSelectors = (
  kind: PortalCaptchaSurfaceKind,
  base?: PortalCaptchaSelectorSet,
): PortalCaptchaSelectorSet => ({
  ...(base ?? PORTAL_CAPTCHA_SELECTORS),
  confirmControl:
    kind === 'inline'
      ? PORTAL_CAPTCHA_INLINE_CONFIRM_CONTROL
      : PORTAL_CAPTCHA_SELECTORS.confirmControl,
});
