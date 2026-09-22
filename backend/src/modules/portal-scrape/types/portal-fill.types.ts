import type { DeleteMailTmAccountInput } from '../../mailtm';
import type { PatchrightProxyConfig } from '../../proxy6';
import type {
  PortalAutofillCaptchaRestore,
  PortalAutofillPipelineCheckpointCallbacks,
} from './portal-autofill-checkpoint.types';
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
   * Optional Patchright context proxy (Proxy6 lease). When unset, direct
   * host egress (REQ-011 / DEC-005). Never log password.
   */
  browserProxy?: PatchrightProxyConfig;
  /**
   * When true, pipeline creates Mail.tm account after CapMonster success and
   * runs OTP UI (DEC-001). Account create is not done before mapping.
   */
  otpPathArmed?: boolean;
  /**
   * Autofill run id once allocated (nestjs-winston-logger DEC-006).
   * applicationId / applicantId come from mapping for log correlation.
   */
  runId?: string;
  /** Durable checkpoint / heartbeat sinks (portal-autofill-durable-resume DEC-008). */
  checkpoint?: PortalAutofillPipelineCheckpointCallbacks;
  /** Restored captcha budgets/CB on resume (DEC-003); does not skip Verified loop (DEC-005). */
  captchaRestore?: PortalAutofillCaptchaRestore;
  /**
   * Opt-in `#btnSubmit` + success verify for durable workflow REGISTER
   * (DEC-019). Legacy sync POST omits this (prepare-only).
   */
  submitRegisterForm?: boolean;
};

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
  /** OTP UI phase started (create → Generate → fill) after CapMonster success. */
  emailOtpAttempted?: boolean;
  /** OTP wait/extract/`#EmailOtp` fill succeeded. */
  emailOtpOk?: boolean;
  /** `#btnReGenerate` clicks this run (0|1); set when OTP phase started. */
  mailTmResendAttempts?: number;
  /** True when Mail.tm CB refused a call or opened during this run. */
  mailTmCircuitOpen?: boolean;
  /**
   * Soft-fail delete handle when a Mail.tm account was created post-captcha
   * (DEC-010). Never log token. Cleared when mailbox is retained after OTP
   * success (REQ-016 / DEC-007).
   */
  mailTmCleanup?: DeleteMailTmAccountInput;
  /**
   * Disposable address used as portal Email (non-secret). Present when Mail.tm
   * account was created for the OTP path (portal-login-status-check SUB-001).
   */
  mailTmAddress?: string;
  /**
   * Mailbox password for vault retain after OTP success (REQ-016).
   * Never log, report, or HTTP-return. Autofill clears after vault/use.
   */
  mailTmPassword?: string;
  /** True when `#btnSubmit` was clicked (`submitRegisterForm` path). */
  registerSubmitted?: boolean;
  /** True when external RegisterUser success cues matched (DEC-019). */
  registerSuccessVerified?: boolean;
  /**
   * Submit may have applied without confirmed success page →
   * `VERIFY_THEN_REPEAT`.
   */
  registerSubmitAmbiguous?: boolean;
}

export type WidgetOpResult = {
  ok: boolean;
  reason?: string;
  via?: string;
  value?: string;
  visible?: string;
  text?: string;
};
