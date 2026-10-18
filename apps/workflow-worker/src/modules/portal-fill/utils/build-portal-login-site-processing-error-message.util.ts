import { PORTAL_LOGIN_SITE_PROCESSING_ERROR_MESSAGE } from '../constants';

/**
 * Russian site-processing operator message with optional truncated alert text
 * (portal-login-site-error DEC-002 / REQ-005; room toward 500-char client slice).
 */
export const buildPortalLoginSiteProcessingErrorMessage = (
  alertText?: string,
): string => {
  const base = PORTAL_LOGIN_SITE_PROCESSING_ERROR_MESSAGE;
  const trimmed = alertText?.trim();
  if (!trimmed) {
    return base;
  }
  const room = Math.max(0, 480 - base.length - 3);
  if (room <= 0) {
    return base;
  }
  return `${base} (${trimmed.slice(0, room)})`;
};
