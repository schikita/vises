import {
  PORTAL_AUTOFILL_CAPMONSTER_CB_STATE,
  PORTAL_AUTOFILL_RETRY_MSG_APPLICANT_INCOMPLETE,
  PORTAL_AUTOFILL_RETRY_MSG_LOCKED,
  PORTAL_AUTOFILL_RETRY_MSG_PERMANENT_CAPMONSTER,
  PORTAL_AUTOFILL_RETRY_MSG_UNSUPPORTED_COUNTRY,
} from '../constants';
import type {
  PortalAutofillRetryEligibility,
  PortalAutofillRetryEligibilityInput,
} from '../types';
import { hasPortalAutofillLiveNonStaleLock } from './has-portal-autofill-live-non-stale-lock.util';
import { isPortalAutofillCaptchaBudgetExhausted } from './is-portal-autofill-captcha-budget-exhausted.util';
import { isPortalAutofillRunResumeEligible } from './is-portal-autofill-run-resume-eligible.util';
import { looksLikePortalCaptchaMismatchReason } from './looks-like-portal-captcha-mismatch-reason.util';

/**
 * Compute staff retry / start / supersede eligibility for a pair (DEC-008).
 * Single source of truth for UI affordances; reuses resume eligibility util.
 */
export const computePortalAutofillRetryEligibility = (
  input: PortalAutofillRetryEligibilityInput,
): PortalAutofillRetryEligibility => {
  if (
    input.inProgressRun != null &&
    hasPortalAutofillLiveNonStaleLock({
      lockOwner: input.inProgressRun.lockOwner,
      lockHeartbeatAt: input.inProgressRun.lockHeartbeatAt,
      nowMs: input.nowMs,
      staleMs: input.staleMs,
    })
  ) {
    return {
      canResume: false,
      canStartOrSupersede: false,
      captchaRetryViaNewRun: false,
      blockedReasonRu: PORTAL_AUTOFILL_RETRY_MSG_LOCKED,
      impliedMode: 'none',
    };
  }

  if (!input.adapterSupported) {
    return {
      canResume: false,
      canStartOrSupersede: false,
      captchaRetryViaNewRun: false,
      blockedReasonRu: PORTAL_AUTOFILL_RETRY_MSG_UNSUPPORTED_COUNTRY,
      impliedMode: 'none',
    };
  }

  if (!input.applicantReady) {
    return {
      canResume: false,
      canStartOrSupersede: false,
      captchaRetryViaNewRun: false,
      blockedReasonRu: PORTAL_AUTOFILL_RETRY_MSG_APPLICANT_INCOMPLETE,
      impliedMode: 'none',
    };
  }

  const signalRun = input.inProgressRun ?? input.latestTerminalRun;
  if (signalRun?.capmonsterPermanentFailed === true) {
    return {
      canResume: false,
      canStartOrSupersede: false,
      captchaRetryViaNewRun: false,
      blockedReasonRu: PORTAL_AUTOFILL_RETRY_MSG_PERMANENT_CAPMONSTER,
      impliedMode: 'none',
    };
  }

  if (input.inProgressRun != null) {
    const resumeEligible = isPortalAutofillRunResumeEligible({
      status: input.inProgressRun.status,
      capmonsterPermanentFailed: input.inProgressRun.capmonsterPermanentFailed,
      captchaBudgetDeadlineAt: input.inProgressRun.captchaBudgetDeadlineAt,
      capmonsterCbState: input.inProgressRun.capmonsterCbState,
      lockOwner: input.inProgressRun.lockOwner,
      lockHeartbeatAt: input.inProgressRun.lockHeartbeatAt,
      nowMs: input.nowMs,
      staleMs: input.staleMs,
    });

    if (resumeEligible) {
      return {
        canResume: true,
        canStartOrSupersede: true,
        captchaRetryViaNewRun: false,
        blockedReasonRu: null,
        impliedMode: 'resume',
      };
    }

    const cbOpen =
      input.inProgressRun.capmonsterCbState ===
      PORTAL_AUTOFILL_CAPMONSTER_CB_STATE.OPEN;
    const budgetExhausted = isPortalAutofillCaptchaBudgetExhausted(
      input.inProgressRun.captchaBudgetDeadlineAt,
      input.nowMs,
    );
    const portalMismatch = looksLikePortalCaptchaMismatchReason(
      input.inProgressRun.terminalReason,
    );
    const captchaRetryViaNewRun =
      input.captchaServiceKeyConfigured &&
      (cbOpen || budgetExhausted || portalMismatch);

    return {
      canResume: false,
      canStartOrSupersede: true,
      captchaRetryViaNewRun,
      blockedReasonRu: null,
      impliedMode: 'supersede',
    };
  }

  const terminal = input.latestTerminalRun;
  const cbOpen =
    terminal?.capmonsterCbState === PORTAL_AUTOFILL_CAPMONSTER_CB_STATE.OPEN;
  const budgetExhausted = isPortalAutofillCaptchaBudgetExhausted(
    terminal?.captchaBudgetDeadlineAt,
    input.nowMs,
  );
  const portalMismatch = looksLikePortalCaptchaMismatchReason(
    terminal?.terminalReason,
  );
  const captchaRetryViaNewRun =
    input.captchaServiceKeyConfigured &&
    (cbOpen || budgetExhausted || portalMismatch);

  return {
    canResume: false,
    canStartOrSupersede: true,
    captchaRetryViaNewRun,
    blockedReasonRu: null,
    // No live run: POST without supersede starts a new attempt (DEC-008).
    impliedMode: 'start_new',
  };
};
