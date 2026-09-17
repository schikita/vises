import type { PatchrightProxyConfig } from '../../webshare';
import type { FieldResult } from './portal-field.types';
import type { MappingResult } from './portal-mapping.types';

export interface FillRegisterFormOptions {
  /** Absolute file path or http(s) URL. */
  targetUrl: string;
  mapping: MappingResult;
  headed: boolean;
  /** Optional path to write a PNG after fill (operator/verifier evidence). */
  screenshotPath?: string;
  /**
   * CapMonster Cloud API key. When set (non-empty), pipeline may run Verify +
   * BLS solve (DEC-003 / DEC-004). Empty/undefined ⇒ CapMonster off (REQ-012).
   */
  capMonsterApiKey?: string;
  /**
   * Optional Patchright context proxy (Webshare lease). When unset, direct
   * host egress (REQ-006 / DEC-004). Never log password.
   */
  browserProxy?: PatchrightProxyConfig;
  /**
   * MailSlurp API key for OTP wait/extract when OTP path armed (DEC-008).
   * Empty/undefined ⇒ OTP UI skipped.
   */
  mailSlurpApiKey?: string;
  /**
   * Disposable inbox id for this run (created by AutofillService before fill).
   * Required with mailSlurpApiKey to arm OTP UI in the pipeline.
   */
  mailSlurpInboxId?: string;
}

export interface FillRegisterFormResult {
  navigationOk: boolean;
  /** Hard failure before/during navigation or missing #myForm. */
  error?: string;
  fields: FieldResult[];
  countryCodeObserved?: string;
  verifyClicked: boolean;
  /** True after intentional `#EmailOtp` fill on armed OTP path (DEC-009). */
  emailOtpTouched: boolean;
  screenshotPath?: string;
  usedStandIn?: boolean;
  /** Whether CapMonster create/poll was attempted this run (REQ-009). */
  capMonsterAttempted?: boolean;
  /** True only when CapMonster returned a valid answer and cells were applied. */
  capMonsterOk?: boolean;
  /** OTP UI phase started (Generate → fill) after CapMonster success. */
  mailSlurpOtpAttempted?: boolean;
  /** OTP wait/extract/`#EmailOtp` fill succeeded. */
  mailSlurpOtpOk?: boolean;
}

export type WidgetOpResult = {
  ok: boolean;
  reason?: string;
  via?: string;
  value?: string;
  visible?: string;
  text?: string;
};
