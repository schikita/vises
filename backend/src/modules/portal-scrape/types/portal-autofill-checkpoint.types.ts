import type { CapMonsterCircuitBreaker } from './capmonster-circuit.types';
import type {
  PortalAutofillCapMonsterCbCheckpoint,
  PortalAutofillFieldProgressMap,
  PortalAutofillPipelineStage,
} from './portal-autofill-run-lifecycle.types';

/**
 * Durable checkpoint patch written by the fill pipeline (REQ-003 / DEC-008).
 * Never includes field values, tokens, or captcha images (REQ-013).
 */
export type PortalAutofillCheckpointPatch = {
  pipelineStage?: PortalAutofillPipelineStage;
  /** Full replacement map when provided (caller merges). */
  fieldProgress?: PortalAutofillFieldProgressMap;
  captchaAttempt?: number;
  captchaBudgetDeadlineAt?: Date | null;
  capmonsterCb?: PortalAutofillCapMonsterCbCheckpoint;
  capmonsterPermanentFailed?: boolean;
  capmonsterInflightTaskId?: string | null;
};

/** Captcha budget / CB restore handed into the pipeline on resume (DEC-003). */
export type PortalAutofillCaptchaRestore = {
  attempts: number;
  /** Absolute deadline when already entered captcha; null until first captcha entry. */
  budgetDeadlineAt: Date | null;
  circuit: PortalAutofillCapMonsterCbCheckpoint | null;
  /** Mid-poll task abandoned on resume — count toward attempts (DEC-005). */
  countAbandonedInflightAttempt: boolean;
};

/** Snapshot emitted after Verified-loop attempt boundaries (DEC-008). */
export type PortalCaptchaVerifiedLoopCheckpointSnapshot = {
  attempts: number;
  budgetDeadlineAt: Date;
  circuit: CapMonsterCircuitBreaker;
  permanentFailed?: boolean;
  inflightTaskId?: string | null;
};

/**
 * Async sinks from orchestrator into the fill pipeline (TASK-004 / DEC-008).
 * Heartbeat may bump lock columns without rewriting field progress.
 */
export type PortalAutofillPipelineCheckpointCallbacks = {
  onCheckpoint?: (patch: PortalAutofillCheckpointPatch) => Promise<void>;
  onHeartbeat?: () => Promise<void>;
};
