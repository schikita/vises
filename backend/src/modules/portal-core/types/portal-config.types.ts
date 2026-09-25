import type { Proxy6ProxyRuntimeConfig } from '../../proxy6/types/proxy6-runtime-config.types';
import type { PortalEmailProviderValue } from '../../browser-mail/constants/portal-email-provider.constants';

export interface AutofillConfig extends Proxy6ProxyRuntimeConfig {
  portalBaseUrl?: string;
  registerPath: string;
  /**
   * Trimmed login path from VISES_PORTAL_LOGIN_PATH (DEC-009).
   * Empty/whitespace fails closed at resolvePortalLoginUrl.
   */
  loginPath: string;
  /**
   * Captcha service API key (DEC-002). Captcha path enabled iff non-empty
   * after trim (DEC-003 / REQ-002). Verify click gated by this key alone
   * (DEC-005 / REQ-012). Loaded from CAPMONSTER_API_KEY (env key unchanged).
   */
  captchaServiceApiKey?: string;
  /**
   * Product OTP path enabled for this run. Hardcoded true in portal-config
   * (portal-email-otp-mailtm DEC-004). Full arming still requires captcha service
   * key; Mail.tm mode also needs non-empty MAILTM_API_BASE_URL (DEC-007).
   */
  emailOtpEnabled: boolean;
  /**
   * Temporary-email backend from VISES_PORTAL_EMAIL_PROVIDER (DEC-001).
   */
  emailProvider: PortalEmailProviderValue;
  /**
   * Trimmed Mail.tm API origin from MAILTM_API_BASE_URL. Empty/undefined
   * leaves the OTP path unarmed in mailtm mode even when captcha service + product
   * enable are on. Not required for tempmail_plus arming (DEC-007).
   */
  mailTmApiBaseUrl?: string;
}
