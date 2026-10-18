import type { AutofillConfig } from '../types';

/**
 * Non-secret log reason for OTP arming decision.
 */
export const resolvePortalEmailOtpArmReason = (
  config: AutofillConfig,
  otpPathArmed: boolean,
): string => {
  if (otpPathArmed) {
    return 'captcha_and_emailOtpEnabled_and_tempmail_plus';
  }
  const captchaEnabled = (config.captchaServiceApiKey?.trim() ?? '').length > 0;
  if (!captchaEnabled) {
    return 'captcha_service_off';
  }
  if (!config.emailOtpEnabled) {
    return 'emailOtp_disabled';
  }
  return 'tempmail_plus_unarmed_unexpected';
};
