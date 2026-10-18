import type { CaptchaProvider } from '../interfaces/captcha-provider.interface';
import type {
  DeleteTemporaryMailboxInput,
  TemporaryEmailProvider,
} from '../../temporary-email';
import type {
  PortalAutofillCaptchaRestore,
  PortalAutofillPipelineCheckpointCallbacks,
  FieldResult,
  MappingResult,
} from '../../portal-core/types';
import type { PortalPage } from './patchright-surface.types';

export type RunPortalFillPipelineOptions = {
  page: PortalPage;
  mapping: MappingResult;
  screenshotPath?: string;
  /** Non-empty key enables captcha Verify + BLS solve (DEC-003 / DEC-004). */
  captchaServiceApiKey?: string;
  /** Injected captcha port when the captcha-service path is enabled (DEC-015). */
  captchaProvider?: Pick<CaptchaProvider, 'solveBls3x3'>;
  /**
   * When true, after captcha success create temporary mailbox, fill `#Email`,
   * then run Generate → wait → `#EmailOtp` (DEC-001).
   */
  otpPathArmed?: boolean;
  /**
   * Injected temporary-email port for create/wait/extract when OTP path is armed.
   */
  mailProvider?: Pick<
    TemporaryEmailProvider,
    'createAccount' | 'waitLatestMessage' | 'extractOtp'
  >;
  /**
   * Session / workflow identity for temporary-email ops (DEC-004 / DEC-013).
   * Prefer durable workflowId; legacy autofill may pass runId.
   */
  emailContextKey?: string;
  /**
   * Autofill run id once allocated (nestjs-winston-logger DEC-006).
   * applicationId / applicantId come from mapping for log correlation.
   */
  runId?: string;
  /** Durable checkpoint / heartbeat sinks (portal-autofill-durable-resume DEC-008). */
  checkpoint?: PortalAutofillPipelineCheckpointCallbacks;
  /**
   * Restored captcha attempt / CB / deadline on resume (DEC-003).
   * Prior `captchaOk` must not skip the loop after re-nav (DEC-005).
   */
  captchaRestore?: PortalAutofillCaptchaRestore;
  /**
   * When true, click `#btnSubmit` after fill/OTP and verify `succes.html` cues
   * before overall success (REQ-009 / DEC-019). Default false — legacy staff
   * sync autofill stays prepare-only (no submit).
   */
  submitRegisterForm?: boolean;
  /**
   * Optional fill/workflow abort signal forwarded into Verified-loop
   * progressive unsolvable backoff (DEC-012).
   */
  abortSignal?: AbortSignal;
};

export type RunPortalFillPipelineResult = {
  /** False on CAPTCHA/login/#myForm hard failures (maps to navigationOk: false). */
  ok: boolean;
  error?: string;
  /** Structured failure code when known (e.g. CapMonster unsolvable exhaustion). */
  errorCode?: string;
  fields: FieldResult[];
  countryCodeObserved?: string;
  screenshotPath?: string;
  usedStandIn?: boolean;
  verifyClicked: boolean;
  /** True after intentional `#EmailOtp` fill (DEC-009). */
  emailOtpTouched: boolean;
  captchaAttempted?: boolean;
  captchaOk?: boolean;
  emailOtpAttempted?: boolean;
  emailOtpOk?: boolean;
  /** `#btnReGenerate` clicks this run (0|1); set when OTP phase started. */
  emailOtpResendAttempts?: number;
  /** True when mail-provider CB refused a call or opened during this run. */
  mailProviderCircuitOpen?: boolean;
  /**
   * Soft-fail delete handle when a temporary mailbox was created post-captcha
   * (DEC-010). Never log token. Cleared by autofill when mailbox is retained
   * after OTP success (REQ-016 / DEC-007).
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
   * Message id used for EmailOtp extract (exclude when waiting for the
   * post-registration portal password email).
   */
  emailOtpMessageId?: string;
  /**
   * True when `#btnSubmit` was clicked this run (`submitRegisterForm` path).
   */
  registerSubmitted?: boolean;
  /**
   * True when external success cues matched (`succes.html` / DEC-019).
   * Required for workflow REGISTER COMPLETED (REQ-007).
   */
  registerSuccessVerified?: boolean;
  /**
   * True when submit may have taken effect but success page was not confirmed
   * → caller must classify `VERIFY_THEN_REPEAT` (DEC-004).
   */
  registerSubmitAmbiguous?: boolean;
};
