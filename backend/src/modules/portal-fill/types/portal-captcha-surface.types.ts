import type { PortalCaptchaSelectorSet } from '../constants/portal-captcha-selectors.constants';
import type { PortalFrame, PortalPage } from './patchright-surface.types';

/**
 * Captcha challenge host surface (portal-login-inline-captcha DEC-001 / DEC-002).
 * - `iframe` — GenerateCaptcha in `iframe.k-content-frame` (register)
 * - `inline` — main-document `#captcha-main-div` / `.main-div-container` (login)
 */
export type PortalCaptchaSurfaceKind = 'iframe' | 'inline';

/**
 * Resolved challenge context for extract / apply / confirm (DEC-001 / DEC-005).
 * `selectors.confirmControl` is surface-adjusted (`#submit` vs `#btnVerify`).
 */
export type PortalCaptchaChallengeContext = {
  kind: PortalCaptchaSurfaceKind;
  context: PortalPage | PortalFrame;
  selectors: PortalCaptchaSelectorSet;
};
