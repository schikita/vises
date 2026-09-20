import type { WebshareProxyRuntimeConfig } from '../../webshare';

export interface AutofillConfig extends WebshareProxyRuntimeConfig {
  portalBaseUrl?: string;
  registerPath: string;
  /**
   * CapMonster Cloud API key (DEC-002). CapMonster path enabled iff non-empty
   * after trim (DEC-003 / REQ-002). Verify click gated by this key alone
   * (DEC-005 / REQ-012).
   */
  capMonsterApiKey?: string;
  /**
   * Product OTP path enabled for this run. Hardcoded true in portal-config
   * (portal-email-otp-mailtm DEC-004). Full arming still requires CapMonster
   * key ∧ non-empty MAILTM_API_BASE_URL at autofill (REQ-002).
   */
  emailOtpEnabled: boolean;
  /**
   * Trimmed Mail.tm API origin from MAILTM_API_BASE_URL. Empty/undefined
   * leaves the OTP path unarmed even when CapMonster + product enable are on.
   */
  mailTmApiBaseUrl?: string;
}
