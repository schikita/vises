export type {
  CaptchaProviderSolveInput,
  CaptchaProviderSolveResult,
} from './captcha-provider.types';

export type {
  PortalFillAbortCooperation,
  PortalFillBrowserClose,
  PortalFillOnBrowserLaunched,
} from './portal-fill-abort.types';

export type {
  FillRegisterFormOptions,
  FillRegisterFormResult,
  WidgetOpResult,
} from './portal-fill.types';

export type {
  RunPortalFillPipelineOptions,
  RunPortalFillPipelineResult,
} from './portal-fill-pipeline.types';

export type { PortalRegisterSuccessVerifyResult } from './portal-register-success.types';
export type { DetectBlockingPageOptions } from './portal-page-guards.types';

export type {
  PortalBrowser,
  PortalBrowserContext,
  PortalChromium,
  PortalFrame,
  PortalLocator,
  PortalPage,
  PortalPatchrightModule,
} from './patchright-surface.types';

export type {
  ConsentModalStepId,
  ConsentModalStepOutcome,
  ConsentModalStepResult,
  DismissConsentModalsResult,
  ConsentModalActionArg,
  ConsentModalActionResult,
} from './portal-consent-modals.types';

export type {
  BlsChallengeExtract,
  ApplyBlsAnswerResult,
  SolvePortalBlsCaptchaInput,
  SolvePortalBlsCaptchaResult,
  ExtractBlsChallengeInPageArg,
  ExtractBlsChallengeInPageResult,
  ApplyBlsAnswerInPageArg,
  ApplyBlsAnswerInPageResult,
} from './portal-captcha.types';

export type { PortalRegisterUserSelectors } from './portal-register-user-selectors.types';
export type { PortalLoginSelectors } from './portal-login-selectors.types';
export type { DiscoverLoginEmailControlResult } from './discover-login-email-control.types';
export type { DiscoverLoginPasswordControlResult } from './discover-login-password-control.types';
export type { PortalLoginAuthVerifyResult } from './portal-login-auth.types';

export type {
  CaptchaCircuitState,
  CaptchaCircuitBreaker,
  CaptchaCircuitRecordFailureResult,
} from './captcha-circuit.types';

export type {
  RunPortalCaptchaVerifiedLoopInput,
  RunPortalCaptchaVerifiedLoopResult,
  PortalCaptchaVerifiedLoopStopReason,
} from './portal-captcha-verified-loop.types';

export type {
  PortalCaptchaChainEndReason,
  RunPortalCaptchaChainAfterPassInput,
  RunPortalCaptchaChainAfterPassResult,
} from './portal-captcha-chain.types';

export type { PortalCaptchaVerifiedLoopCheckpointSnapshot } from './portal-captcha-verified-loop-checkpoint.types';

export type {
  PortalOtpOkModalActionArg,
  PortalOtpOkModalActionResult,
} from './portal-otp-modal.types';

export type { BuildEmailOtpNotesInput } from './email-otp-notes.types';

export type { PortalPasswordChangeSelectors } from './portal-password-change-selectors.types';
export type {
  FillPortalPasswordChangeOptions,
  FillPortalPasswordChangeResult,
  PortalPasswordChangeFormVisibleResult,
  PortalPasswordChangeVerifyResult,
  RunPortalPasswordChangePipelineOptions,
  RunPortalPasswordChangePipelineResult,
} from './portal-password-change.types';

export type { BlsApplicantPortalStatus } from './bls-applicant-portal-status.types';
export type { PortalStatusSelectors } from './portal-status-selectors.types';
export type {
  PortalApplicantStatusRow,
  PortalStatusApplicantMatchHint,
  RunPortalStatusValidatePipelineOptions,
  RunPortalStatusValidatePipelineResult,
  FillPortalStatusValidateOptions,
  FillPortalStatusValidateResult,
} from './portal-status.types';

export type { PortalBookingSelectors } from './portal-booking-selectors.types';
export type {
  PortalBookingPrefillHint,
  PortalBookingPrefillOutcome,
  RunPortalBookingSafeStopPipelineOptions,
  RunPortalBookingSafeStopPipelineResult,
  FillPortalBookingSafeStopOptions,
  FillPortalBookingSafeStopResult,
} from './portal-booking.types';

export type {
  FillPortalLoginPrepOptions,
  FillPortalLoginPrepResult,
  RunPortalLoginPrepPipelineOptions,
  RunPortalLoginPrepPipelineResult,
} from './portal-login-prep-fill.types';

/** Shared portal-core types used by fill pipelines / field widgets. */
export type {
  FieldResult,
  FieldStatus,
  PortalFieldName,
  MappingResult,
  AutofillConfig,
  PortalAutofillFieldProgressEntry,
  PortalAutofillFieldProgressMap,
  PortalAutofillCheckpointPatch,
  PortalAutofillCaptchaRestore,
  PortalAutofillPipelineCheckpointCallbacks,
  PortalAutofillCapMonsterCbCheckpoint,
  PortalLogContext,
} from '../../portal-core/types';
