import { PORTAL_EMAIL_PROVIDER } from '../constants';
import type { AutofillConfig } from '../types';

/**
 * OTP path arming predicate (DEC-007 / REQ-014).
 * Captcha service key ∧ product emailOtpEnabled; mailtm mode also requires
 * non-empty MAILTM_API_BASE_URL; tempmail_plus does not.
 */
export const isPortalEmailOtpArmed = (config: AutofillConfig): boolean => {
  const captchaEnabled = (config.captchaServiceApiKey?.trim() ?? '').length > 0;
  if (!captchaEnabled || !config.emailOtpEnabled) {
    return false;
  }
  if (config.emailProvider === PORTAL_EMAIL_PROVIDER.TEMPMAIL_PLUS) {
    return true;
  }
  return (config.mailTmApiBaseUrl?.trim() ?? '').length > 0;
};
