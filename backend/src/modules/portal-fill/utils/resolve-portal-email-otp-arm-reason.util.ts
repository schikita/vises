import { PORTAL_EMAIL_PROVIDER } from '../constants';
import type { AutofillConfig } from '../types';

/**
 * Non-secret log reason for OTP arming decision (DEC-007).
 */
export const resolvePortalEmailOtpArmReason = (
  config: AutofillConfig,
  otpPathArmed: boolean,
): string => {
  if (otpPathArmed) {
    return config.emailProvider === PORTAL_EMAIL_PROVIDER.TEMPMAIL_PLUS
      ? 'captcha_and_emailOtpEnabled_and_tempmail_plus'
      : 'captcha_and_emailOtpEnabled_and_mailtm_base_url';
  }
  const captchaEnabled = (config.captchaServiceApiKey?.trim() ?? '').length > 0;
  if (!captchaEnabled) {
    return 'captcha_service_off';
  }
  if (!config.emailOtpEnabled) {
    return 'emailOtp_disabled';
  }
  if (config.emailProvider === PORTAL_EMAIL_PROVIDER.TEMPMAIL_PLUS) {
    return 'tempmail_plus_unarmed_unexpected';
  }
  return 'mailtm_base_url_empty';
};
