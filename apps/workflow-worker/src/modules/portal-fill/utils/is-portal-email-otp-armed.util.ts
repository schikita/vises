import type { AutofillConfig } from '../types';

/**
 * OTP path arming predicate: captcha service key ∧ product emailOtpEnabled.
 */
export const isPortalEmailOtpArmed = (config: AutofillConfig): boolean => {
  const captchaEnabled = (config.captchaServiceApiKey?.trim() ?? '').length > 0;
  return captchaEnabled && config.emailOtpEnabled;
};
