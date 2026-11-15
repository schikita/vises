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
  PortalDialog,
  PortalDialogHandler,
  PortalFrame,
  PortalLocator,
  PortalPage,
  PortalPatchrightModule,
} from './patchright-surface.types';

export type { PortalDomContext } from './portal-dom-context.types';
export type { PortalWidgetSurface } from './portal-widget-surface.types';
export type {
  FillPortalApplicantEditFormOptions,
  FillPortalApplicantEditFormResult,
  FillPortalApplicantEditFormSuccess,
  FillPortalApplicantEditFormFailure,
} from './fill-portal-applicant-edit-form.types';
export type {
  ApplyEditMemberPlanFieldOptions,
  ApplyEditMemberPlanFieldResult,
} from './apply-edit-member-plan-field.types';
export type { EditMemberFieldCurrentValue } from './edit-member-field-current-value.types';
export type {
  FillEditMemberSectionOptions,
  FillEditMemberSectionResult,
} from './fill-edit-member-section.types';

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

export type {
  PortalCaptchaSurfaceKind,
  PortalCaptchaChallengeContext,
} from './portal-captcha-surface.types';

export type { PortalRegisterUserSelectors } from './portal-register-user-selectors.types';
export type { PortalLoginSelectors } from './portal-login-selectors.types';
export type { DiscoverLoginEmailControlResult } from './discover-login-email-control.types';
export type { DiscoverLoginPasswordControlResult } from './discover-login-password-control.types';
export type { PortalLoginAuthVerifyResult } from './portal-login-auth.types';
export type {
  PortalLoginSiteProcessingAlertProbeResult,
  PortalLoginSiteFailureSignatureResult,
} from './portal-login-site-error.types';
export type { SettlePortalPageAfterLoginVerifyResult } from './settle-portal-page-after-login-verify.types';
export type { SettlePortalPageAfterPasswordChangeSubmitResult } from './settle-portal-page-after-password-change-submit.types';

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
  PortalCaptchaEpisodeSuccessVia,
  WaitForPortalCaptchaEpisodeSuccessResult,
} from './portal-captcha-episode-success.types';

export type {
  PortalCaptchaChainEndReason,
  RunPortalCaptchaChainAfterPassInput,
  RunPortalCaptchaChainAfterPassResult,
  WaitPortalCaptchaChainAfterPassMsResult,
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
  PortalStatusCheckpointStep,
  PortalStatusMemberBranch,
  PortalStatusFieldSkipReason,
  PortalStatusFieldFailReason,
  PortalStatusFieldProgressFailedEntry,
  PortalStatusFieldProgress,
  PortalStatusFieldProgressCounts,
  PortalStatusCheckpoint,
  PortalStatusCheckpointPatch,
  PortalStatusCheckpointCallbacks,
  LoadPortalStatusCheckpointResult,
  SavePortalStatusCheckpointInput,
} from './portal-status-checkpoint.types';
export type {
  PortalApplicantStatusRow,
  PortalStatusApplicantMatchHint,
  RunPortalStatusValidatePipelineOptions,
  RunPortalStatusValidatePipelineResult,
  FillPortalStatusValidateOptions,
  FillPortalStatusValidateResult,
} from './portal-status.types';
export type { PortalStatusMaErrorCode } from './portal-status-ma-error.types';
export type {
  PortalEditSubmitDialogOutcome,
  RegisterPortalEditSubmitDialogListenerResult,
} from './portal-edit-submit-dialog.types';
export type { SubmitPortalApplicantEditFormResult } from './portal-edit-submit.types';
export type { IsPortalApplicantEditValidationSummaryClearResult } from './is-portal-applicant-edit-validation-summary-clear.types';
export type { AssertPortalManageApplicantsReadyForBookResult } from './assert-portal-manage-applicants-ready-for-book.types';
export type {
  ResolvePortalStatusAddFamilyMemberGateInput,
  ResolvePortalStatusAddFamilyMemberGateResult,
} from './resolve-portal-status-add-family-member-gate.types';
export type {
  PortalStatusMemberOpenMode,
  ResolvePortalStatusMemberOpenPathInput,
  ResolvePortalStatusMemberOpenPathResult,
} from './resolve-portal-status-member-open-path.types';
export type {
  ResolvePortalStatusAddResumeSkipInput,
  ResolvePortalStatusAddResumeSkipResult,
} from './resolve-portal-status-add-resume-skip.types';
export type { ProbePortalStatusMemberFormPathOpenResult } from './probe-portal-status-member-form-path-open.types';
export type { EditMemberPortalFieldId } from './edit-member-portal-field.types';
export type { PortalWidgetFieldName } from './portal-widget-field.types';
export type {
  EditMemberFieldPlanAction,
  EditMemberFieldPlanReasonCode,
  EditMemberFieldPlanEntry,
  EditMemberFillInput,
  EditMemberCrmApplicantSource,
  EditMemberCrmApplicationSource,
  EditMemberCrmSource,
} from './edit-member-fill-input.types';
export type { EditMemberLegacyTextFill } from './edit-member-legacy-text-fill.types';

export type { PortalBookingSelectors } from './portal-booking-selectors.types';
export type {
  PortalBookingPrefillHint,
  PortalBookingPrefillOutcome,
  RunPortalBookingContinuePipelineOptions,
  RunPortalBookingContinuePipelineResult,
  FillPortalBookingContinueOptions,
  FillPortalBookingContinueResult,
} from './portal-booking.types';
export type { PortalBookingPremiumOrPaymentSurface } from './portal-booking-premium-or-payment-surface.types';
export type { ResolvePortalBookingCategoryOptionResult } from './resolve-portal-booking-category-option.types';
export type {
  ResolvePortalStatusResumeEntryInput,
  ResolvePortalStatusResumeEntryResult,
} from './resolve-portal-status-resume-entry.types';
export type { SelectPortalBookingAppointmentForResult } from './select-portal-booking-appointment-for.types';
export type {
  PortalBookingCheckpointStep,
  PortalBookingCheckpointOutcome,
  PortalBookingCheckpointStuckCode,
  PortalBookingFieldProgressStatus,
  PortalBookingFieldProgress,
  PortalBookingCheckpoint,
  PortalBookingCheckpointPatch,
  PortalBookingCheckpointCallbacks,
  LoadPortalBookingCheckpointResult,
  SavePortalBookingCheckpointInput,
} from './portal-booking-checkpoint.types';
export type {
  PortalBookingEmailConsentMailbox,
  CompletePortalBookingEmailConsentOptions,
  CompletePortalBookingEmailConsentResult,
} from './portal-booking-email-consent.types';
export type {
  RunPortalBookingCaptchaPhaseOptions,
  RunPortalBookingCaptchaPhaseResult,
} from './portal-booking-captcha.types';
export type {
  RunPortalBookingSlotsUnavailablePhaseOptions,
  RunPortalBookingSlotsUnavailablePhaseResult,
} from './portal-booking-slots-unavailable.types';

export type {
  PortalStuckEvidenceBag,
  PortalEnterStuckPoint,
  PortalSiteHttpResumeHint,
  PortalEnterResumeHint,
  PortalStuckResumeHint,
} from './portal-stuck-evidence.types';
export type { PortalEnterErrorCode } from './portal-enter-error.types';
export type {
  PortalSiteHttpErrorCode,
  ClassifyPortalSiteHttpErrorFromTextInput,
  ClassifyPortalSiteHttpErrorFromTextResult,
  DetectPortalSiteHttpErrorResult,
} from './portal-site-http-error.types';
export type {
  CheckPortalAuthenticatedHomeCuesInput,
  PortalAuthenticatedHomeCueFlags,
  PortalAuthenticatedHomeCueCheckResult,
  IsPortalAuthenticatedHomeRecognizedResult,
  ResolvePortalHomeNewappointmentCtaResult,
  EnsurePortalAuthenticatedHomeOptions,
  EnsurePortalAuthenticatedHomeResult,
} from './portal-home.types';
export type { WaitForPortalOverlaysClearResult } from './portal-overlay.types';

export type {
  FillPortalLoginPrepOptions,
  FillPortalLoginPrepResult,
  RunPortalLoginPrepPipelineOptions,
  RunPortalLoginPrepPipelineResult,
} from './portal-login-prep-fill.types';

export type {
  EnsurePortalLoginCredentialsForCaptchaOptions,
  EnsurePortalLoginCredentialFieldOutcome,
  EnsurePortalLoginCredentialsForCaptchaResult,
} from './portal-login-credentials-ensure.types';

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
