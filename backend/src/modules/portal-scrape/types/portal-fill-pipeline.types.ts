import type { ICaptchaSolver } from '../../capmonster';
import type {
  DeleteMailTmAccountInput,
  TemporaryEmailProvider,
} from '../../mailtm';
import type {
  PortalAutofillCaptchaRestore,
  PortalAutofillPipelineCheckpointCallbacks,
} from './portal-autofill-checkpoint.types';
import type { FieldResult } from './portal-field.types';
import type { MappingResult } from './portal-mapping.types';
import type { PortalPage } from './patchright-surface.types';

export type RunPortalFillPipelineOptions = {
  page: PortalPage;
  mapping: MappingResult;
  screenshotPath?: string;
  /** Non-empty key enables CapMonster Verify + BLS solve (DEC-003 / DEC-004). */
  capMonsterApiKey?: string;
  /** Injected captcha solver when the CapMonster path is enabled. */
  capMonster?: Pick<ICaptchaSolver, 'solveBls3x3'>;
  /**
   * When true, after CapMonster success create Mail.tm account, fill `#Email`,
   * then run Generate → wait → `#EmailOtp` (DEC-001).
   */
  otpPathArmed?: boolean;
  /**
   * Injected temporary-email client for create/wait/extract when OTP path is armed.
   */
  mailTm?: Pick<
    TemporaryEmailProvider,
    'createAccount' | 'waitLatestMessage' | 'extractOtp'
  >;
  /**
   * Autofill run id once allocated (nestjs-winston-logger DEC-006).
   * applicationId / applicantId come from mapping for log correlation.
   */
  runId?: string;
  /** Durable checkpoint / heartbeat sinks (portal-autofill-durable-resume DEC-008). */
  checkpoint?: PortalAutofillPipelineCheckpointCallbacks;
  /**
   * Restored captcha attempt / CB / deadline on resume (DEC-003).
   * Prior `capMonsterOk` must not skip the loop after re-nav (DEC-005).
   */
  captchaRestore?: PortalAutofillCaptchaRestore;
  /**
   * When true, click `#btnSubmit` after fill/OTP and verify `succes.html` cues
   * before overall success (REQ-009 / DEC-019). Default false — legacy staff
   * sync autofill stays prepare-only (no submit).
   */
  submitRegisterForm?: boolean;
};

export type RunPortalFillPipelineResult = {
  /** False on CAPTCHA/login/#myForm hard failures (maps to navigationOk: false). */
  ok: boolean;
  error?: string;
  fields: FieldResult[];
  countryCodeObserved?: string;
  screenshotPath?: string;
  usedStandIn?: boolean;
  verifyClicked: boolean;
  /** True after intentional `#EmailOtp` fill (DEC-009). */
  emailOtpTouched: boolean;
  capMonsterAttempted?: boolean;
  capMonsterOk?: boolean;
  emailOtpAttempted?: boolean;
  emailOtpOk?: boolean;
  /** `#btnReGenerate` clicks this run (0|1); set when OTP phase started. */
  mailTmResendAttempts?: number;
  /** True when Mail.tm CB refused a call or opened during this run. */
  mailTmCircuitOpen?: boolean;
  /**
   * Soft-fail delete handle when a Mail.tm account was created post-captcha
   * (DEC-010). Never log token. Cleared by autofill when mailbox is retained
   * after OTP success (REQ-016 / DEC-007).
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
