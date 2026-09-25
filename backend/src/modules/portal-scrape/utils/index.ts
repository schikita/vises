export { normalizeTargetUrl } from '../../portal-core';
export { resolveRegisterPath } from '../../portal-core';
export { resolveLoginPath } from '../../portal-core';
export { mapAutofillReportToHttpOutcome } from './map-autofill-http-status.util';
export { buildCaptchaServiceNotes } from './build-captcha-service-notes.util';
export { mappingOk } from '../../portal-core';
export { maskSensitiveValue } from '../../portal-core';
export { buildReport } from '../../portal-core';
export { buildEvidenceRelativePath } from '../../portal-core';
export { buildEvidenceAbsolutePath } from '../../portal-core';
export { resolveEvidenceAbsolutePath } from './resolve-evidence-absolute-path.util';
export { ensureEvidenceDir } from '../../portal-core';
export { evidenceFileExists } from '../../portal-core';
export { openEvidenceStream } from './open-evidence-stream.util';
export { unlinkEvidenceBestEffort } from '../../portal-core';
export { buildPortalAutofillScreenshotDownloadPath } from './build-portal-autofill-screenshot-download-path.util';
export { mapPortalAutofillRunListItem } from './map-portal-autofill-run-list-item.util';
export { summarizePortalFieldProgressJson } from '../../portal-core';
export { buildPortalAutofillCaptchaSummary } from './build-portal-autofill-captcha-summary.util';
export { resolvePortalAutofillCapMonsterCbState } from './resolve-portal-autofill-capmonster-cb-state.util';
export { resolvePortalAutofillRunStatus } from './resolve-portal-autofill-run-status.util';
export { computePortalAutofillRetryEligibility } from './compute-portal-autofill-retry-eligibility.util';
export { hasPortalAutofillLiveNonStaleLock } from './has-portal-autofill-live-non-stale-lock.util';
export { isPortalAutofillCaptchaBudgetExhausted } from './is-portal-autofill-captcha-budget-exhausted.util';
export { looksLikePortalCaptchaMismatchReason } from './looks-like-portal-captcha-mismatch-reason.util';
export { isPortalSubmitCountryBelarusAllowlisted } from '../../portal-core';
export { mapPortalClientPortalProgress } from '../../portal-core';
export { resolvePortalSiteOutcomeForAdapter } from '../../portal-core';
export { resolvePortalAutofillEligibilityApplicantId } from './resolve-portal-autofill-eligibility-applicant-id.util';
export { buildPortalAutofillEmptyRetryEligibility } from './build-portal-autofill-empty-retry-eligibility.util';
export { listApplicationApplicantIds } from '../../portal-core';
export { clampPortalAutofillRunListLimit } from './clamp-portal-autofill-run-list-limit.util';
export { buildLoginPrepEvidenceAbsolutePath } from './build-login-prep-evidence-absolute-path.util';
export { classifyPortalBookingUnsafeAction } from '../../bls-workflow';
export { resolvePortalTemporaryEmailProvider } from '../../browser-mail';
export { formatPortalLogContext } from '../../portal-core';
export { summarizeFieldFillCounts } from '../../portal-core';
export { isPortalAutofillLockStale } from './is-portal-autofill-lock-stale.util';
export { isPortalAutofillRunResumeEligible } from './is-portal-autofill-run-resume-eligible.util';
export { buildPortalAutofillLockOwner } from '../../portal-core';
export { parseSecretsMasterKey } from '../../bls-secrets';
export { aesGcmSeal } from '../../bls-secrets';
export { aesGcmOpen } from '../../bls-secrets';
export { wrapDek } from '../../bls-secrets';
export { unwrapDek } from '../../bls-secrets';
export { generatePortalPassword } from '../../bls-secrets';

/** Fill-owned helpers re-exported for transitional façade / client imports. */
export {
  runPortalFillPipeline,
  clickPortalRegisterSubmit,
  verifyPortalRegisterSuccess,
  dismissConsentModalsInOrder,
  consentModalStepBudgetMs,
  consentModalPresenceWindowMs,
  assertCaptchaSelectorsReady,
  extractBlsChallenge,
  applyBlsAnswer,
  resolveCaptchaFrame,
  solvePortalBlsCaptcha,
  isPortalCaptchaVerified,
  createCaptchaCircuitBreaker,
  assertCaptchaCircuitAllowsCall,
  recordCaptchaCircuitSuccess,
  recordCaptchaCircuitFailure,
  isPortalCaptchaChallengeAbsentError,
  clickPortalCaptchaVerifyControl,
  portalCaptchaVerifiedLoopSleep,
  waitForPortalCaptchaVerified,
  ensurePortalCaptchaChallengeReady,
  runPortalCaptchaVerifiedLoop,
  clickPortalGenerateOtp,
  clickPortalResendOtp,
  dismissPortalOtpOkModal,
  otpOkModalActionInPage,
  fillPortalEmailOtp,
  fillPortalEmail,
  discoverLoginEmailControl,
  fillPortalLoginEmail,
  discoverLoginPasswordControl,
  fillPortalLoginPassword,
  waitForPortalLoginPasswordControl,
  isPortalLoginFormVisible,
  verifyPortalLoginAuthenticated,
  clickPortalLoginVerifyControl,
  runPortalLoginPrepPipeline,
  isPortalPasswordChangeFormVisible,
  fillPortalPasswordChangeForm,
  clickPortalPasswordChangeSubmit,
  verifyPortalPasswordChangeSuccess,
  runPortalPasswordChangePipeline,
  normalizeBlsApplicantPortalStatus,
  isBlsApplicantPortalStatusReadyToBook,
  areRequiredApplicantsReadyToBook,
  matchPortalApplicantStatusRow,
  scrapePortalApplicantStatusRows,
  waitForPortalManageApplicantsPage,
  clickPortalApplicantEdit,
  acceptPortalAttentionModal,
  isPortalApplicantEditFormVisible,
  fillPortalApplicantEditForm,
  clickPortalApplicantEditSubmit,
  runPortalStatusValidatePipeline,
  isPortalBookingSelectionUiVisible,
  waitForPortalBookingSelectionUi,
  clickPortalBookNewAppointment,
  prefillPortalBookingSelectionFields,
  runPortalBookingSafeStopPipeline,
  buildEmailOtpNotes,
  isPortalEmailOtpArmed,
  resolvePortalEmailOtpArmReason,
  shouldRetainMailTmMailboxAfterOtp,
  serializeCaptchaCircuitForCheckpoint,
  restoreCaptchaCircuitFromCheckpoint,
  shouldAbandonCapMonsterInflightTaskOnResume,
  mergePortalAutofillFieldProgress,
  mapFieldResultToProgressEntry,
  buildPortalAutofillCaptchaRestore,
} from '../../portal-fill';

/** Workflow-owned helpers re-exported for transitional façade imports. */
export {
  isBlsWorkflowTaskExecutorSkipped,
  isBlsWorkflowStatusActive,
  isBlsWorkflowStatusTerminal,
  isBlsWorkflowStatusPaused,
  isBlsWorkflowMailboxCleanupEligible,
  isBlsWorkflowPortalCredentialsRevealEligible,
  computeBlsWorkflowMailboxCleanupDueAt,
  computeBlsWorkflowEventRetentionCutoff,
  isBlsWorkflowTaskDoneStatus,
  isBlsWorkflowStepDoneStatus,
  isBlsWorkflowStepSkippable,
  assertBlsCompleteVerified,
  buildBlsWorkflowStepTaskDrafts,
  buildBlsWorkflowGraphDraft,
  planBlsWorkflowAdvance,
  findNextBlsWorkflowOpenTask,
  isBlsWorkflowLockStale,
  hasBlsWorkflowLiveNonStaleLock,
  buildBlsWorkflowLockOwner,
  createBlsWorkflowLockError,
  isBlsWorkflowLockError,
  isBlsWorkflowErrorClassSafeToRepeat,
  isBlsWorkflowErrorClassVerifyThenRepeat,
  isBlsWorkflowErrorClassNotSafeToRepeat,
  isBlsWorkflowErrorClassAutoRetryable,
  computeBlsWorkflowRetryBackoffMs,
  computeBlsWorkflowNextRunAt,
  findCurrentBlsWorkflowReadyTask,
  mapBlsWorkflowGraphToOut,
  mapBlsWorkflowEventToOut,
  clampBlsWorkflowEventsLimit,
  parseBlsWorkflowSinceEventId,
  mapBlsWorkflowToStartOut,
  mapBlsWorkflowToControlOut,
  isBlsWorkflowManualRetryEligible,
  resolveBlsWorkflowManualRetryTask,
  isBlsWorkflowResumeEligible,
  isBlsWorkflowPauseEligible,
} from '../../bls-workflow';
