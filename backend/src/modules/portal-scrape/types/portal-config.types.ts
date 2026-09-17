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
   * MailSlurp API key. Non-empty after trim is required (with CapMonster) to
   * arm the email-OTP path (DEC-001 / REQ-001). Empty ⇒ undefined ⇒ unarmed.
   */
  mailSlurpApiKey?: string;
}
