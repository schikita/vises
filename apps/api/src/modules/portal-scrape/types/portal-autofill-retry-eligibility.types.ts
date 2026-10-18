/**
 * Server-computed retry / start / supersede affordances for a
 * application+applicant pair (DEC-008 / REQ-008–011).
 */
export type PortalAutofillRetryImpliedMode =
  | 'resume'
  | 'start_new'
  | 'supersede'
  | 'none';

export type PortalAutofillRetryEligibility = {
  canResume: boolean;
  canStartOrSupersede: boolean;
  /**
   * True only for transient CB-open / Verified-loop budget / portal-mismatch
   * paths where UI may label a supersede/new-run as captcha retry.
   */
  captchaRetryViaNewRun: boolean;
  /** Short Russian explanation when actions are blocked; null when eligible. */
  blockedReasonRu: string | null;
  impliedMode: PortalAutofillRetryImpliedMode;
};

/**
 * Inputs for `computePortalAutofillRetryEligibility` (no secrets).
 * Captcha service key presence is a boolean flag only.
 */
export type PortalAutofillRetryEligibilityInput = {
  inProgressRun: {
    status: string | null;
    lockOwner: string | null;
    lockHeartbeatAt: Date | null;
    captchaBudgetDeadlineAt: Date | null;
    capmonsterCbState: string | null;
    capmonsterPermanentFailed: boolean;
    terminalReason: string | null;
  } | null;
  /** Latest terminal / legacy-null run for the pair (permanent/CB signals). */
  latestTerminalRun: {
    status: string | null;
    captchaBudgetDeadlineAt: Date | null;
    capmonsterCbState: string | null;
    capmonsterPermanentFailed: boolean;
    terminalReason: string | null;
  } | null;
  applicantReady: boolean;
  adapterSupported: boolean;
  /** True when trimmed `CAPMONSTER_API_KEY` is non-empty. */
  captchaServiceKeyConfigured: boolean;
  nowMs: number;
  staleMs?: number;
};
