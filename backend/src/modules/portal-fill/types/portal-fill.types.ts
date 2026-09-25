import type { PatchrightProxyConfig } from '../../proxy6/types/proxy6-lease.types';
import type { DeleteTemporaryMailboxInput } from '../../mailtm/types/temporary-email.types';
import type {
  PortalAutofillCaptchaRestore,
  PortalAutofillPipelineCheckpointCallbacks,
  FieldResult,
  MappingResult,
} from '../../portal-core/types';
import type { PortalFillAbortCooperation } from './portal-fill-abort.types';

export interface FillRegisterFormOptions extends PortalFillAbortCooperation {
  /** Absolute file path or http(s) URL. */
  targetUrl: string;
  mapping: MappingResult;
  headed: boolean;
  /** Optional path to write a PNG after fill (operator/verifier evidence). */
  screenshotPath?: string;
  /**
   * Captcha service API key. When set (non-empty), pipeline may run Verify +
   * BLS solve (DEC-003 / DEC-004). Empty/undefined → captcha service off (REQ-012).
   */
  captchaServiceApiKey?: string;
  /**
   * Optional Patchright context proxy (proxy provider lease). When unset, direct
   * host egress (REQ-011 / DEC-005). Never log password.
   */
  browserProxy?: PatchrightProxyConfig;
  /**
   * When true, pipeline creates a temporary mailbox after captcha success and
   * runs OTP UI (DEC-001). Account create is not done before mapping.
   */
  otpPathArmed?: boolean;
  /**
   * Session / workflow identity for temporary-email ops (DEC-004 / DEC-013).
   */
  emailContextKey?: string;
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
}

export interface FillRegisterFormResult {
  navigationOk: boolean;
  /** True when AbortSignal aborted the fill (immediate-stop). */
  aborted?: boolean;
  /** Hard failure before/during navigation or missing #myForm. */
  error?: string;
  /** Structured failure code when known (e.g. CapMonster unsolvable exhaustion). */
  errorCode?: string;
  fields: FieldResult[];
  countryCodeObserved?: string;
  verifyClicked: boolean;
  /** True after intentional `#EmailOtp` fill on armed OTP path (DEC-009). */
  emailOtpTouched: boolean;
  screenshotPath?: string;
  usedStandIn?: boolean;
  /** Whether captcha-service create/poll was attempted this run (REQ-009). */
  captchaAttempted?: boolean;
  /** True only when captcha service returned a valid answer and cells were applied. */
  captchaOk?: boolean;
  /** OTP UI phase started (create → Generate → fill) after captcha success. */
  emailOtpAttempted?: boolean;
  /** OTP wait/extract/`#EmailOtp` fill succeeded. */
  emailOtpOk?: boolean;
  /** `#btnReGenerate` clicks this run (0|1); set when OTP phase started. */
  emailOtpResendAttempts?: number;
  /** True when mail-provider CB refused a call or opened during this run. */
  mailProviderCircuitOpen?: boolean;
  /**
   * Soft-fail delete handle when a temporary mailbox was created post-captcha
   * (DEC-010). Never log token. Cleared when mailbox is retained after OTP
   * success (REQ-016 / DEC-007).
   */
  temporaryMailboxCleanup?: DeleteTemporaryMailboxInput;
  /**
   * Disposable address used as portal Email (non-secret). Present when a
   * temporary mailbox was created for the OTP path.
   */
  temporaryMailboxAddress?: string;
  /**
   * Mailbox password for vault retain after OTP success (REQ-016).
   * Never log, report, or HTTP-return. Autofill clears after vault/use.
   */
  temporaryMailboxPassword?: string;
  /**
   * Message id of the EmailOtp mail (exclude when waiting for portal
   * password email after RegisterUser success).
   */
  emailOtpMessageId?: string;
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
