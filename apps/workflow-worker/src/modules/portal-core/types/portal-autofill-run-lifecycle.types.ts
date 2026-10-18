import {
  PORTAL_AUTOFILL_CAPMONSTER_CB_STATE,
  PORTAL_AUTOFILL_FIELD_PROGRESS_STATUS,
  PORTAL_AUTOFILL_PIPELINE_STAGE,
  PORTAL_AUTOFILL_RUN_STATUS,
} from '../constants/portal-autofill-run-lifecycle.constants';

/** Durable run lifecycle status (REQ-001). Legacy null = terminal evidence-only row. */
export type PortalAutofillRunStatus =
  (typeof PORTAL_AUTOFILL_RUN_STATUS)[keyof typeof PORTAL_AUTOFILL_RUN_STATUS];

/** Pipeline stage checkpoint token (REQ-001 / REQ-003). */
export type PortalAutofillPipelineStage =
  (typeof PORTAL_AUTOFILL_PIPELINE_STAGE)[keyof typeof PORTAL_AUTOFILL_PIPELINE_STAGE];

/** Captcha-service CB state as stored on the run row (REQ-004). */
export type PortalAutofillCapMonsterCbState =
  (typeof PORTAL_AUTOFILL_CAPMONSTER_CB_STATE)[keyof typeof PORTAL_AUTOFILL_CAPMONSTER_CB_STATE];

/** Per-field fill status without values (REQ-005). */
export type PortalAutofillFieldProgressStatus =
  (typeof PORTAL_AUTOFILL_FIELD_PROGRESS_STATUS)[keyof typeof PORTAL_AUTOFILL_FIELD_PROGRESS_STATUS];

/** One field entry in `field_progress_json` (no secret/PII values). */
export type PortalAutofillFieldProgressEntry = {
  status: PortalAutofillFieldProgressStatus;
  reason?: string;
};

/** Map of field name → status/reason for durable checkpoints (REQ-005). */
export type PortalAutofillFieldProgressMap = Record<
  string,
  PortalAutofillFieldProgressEntry
>;

/** Serializable captcha-service CB slice for checkpoint columns (DEC-003). */
export type PortalAutofillCapMonsterCbCheckpoint = {
  state: PortalAutofillCapMonsterCbState;
  consecutiveFailures: number;
  openedAt: Date | null;
};

/** Lock lease snapshot used by eligibility / reclaim helpers (REQ-009). */
export type PortalAutofillLockSnapshot = {
  lockOwner: string | null;
  lockHeartbeatAt: Date | null;
};

/**
 * Inputs for resume eligibility (REQ-007 / REQ-008 / REQ-010).
 * Does not include secrets or field values.
 */
export type PortalAutofillResumeEligibilityInput = {
  status: string | null;
  capmonsterPermanentFailed: boolean;
  captchaBudgetDeadlineAt: Date | null;
  capmonsterCbState: string | null;
  lockOwner: string | null;
  lockHeartbeatAt: Date | null;
  nowMs: number;
  staleMs?: number;
};
