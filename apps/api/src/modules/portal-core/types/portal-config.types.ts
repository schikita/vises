import type { Proxy6ProxyRuntimeConfig } from '../../proxy6/types/proxy6-runtime-config.types';
import type { PortalEmailProviderValue } from '../constants/portal-email-provider.constants';

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
   * Product OTP path enabled for this run. Hardcoded true in portal-config.
   * Full arming still requires captcha service key.
   */
  emailOtpEnabled: boolean;
  /** Temporary-email backend — tempmail_plus only. */
  emailProvider: PortalEmailProviderValue;
}
