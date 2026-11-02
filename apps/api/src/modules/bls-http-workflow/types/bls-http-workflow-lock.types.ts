import type { BlsHttpWorkflow } from '../../database/entities/bls-http-workflow.entity';
import type { BlsHttpWorkflowAttempt } from '../../database/entities/bls-http-workflow-attempt.entity';
import type {
  BlsHttpWorkflowAttemptOutcome,
  BlsHttpWorkflowErrorClass,
} from './bls-http-workflow.types';

/** Typed live-lock / lock-path conflict for HTTP mapping (REQ-005). */
export type BlsHttpWorkflowLockErrorCode = 'live_lock' | 'not_found';

export type CreateBlsHttpWorkflowLockErrorInput = {
  code: BlsHttpWorkflowLockErrorCode;
  message: string;
  httpStatus?: number;
};

export type BlsHttpWorkflowLockError = Error & {
  name: 'BlsHttpWorkflowLockError';
  code: BlsHttpWorkflowLockErrorCode;
  httpStatus: number;
};

/** Result of a successful lock acquire / claim. */
export type BlsHttpWorkflowLockLease = {
  workflow: BlsHttpWorkflow;
  lockOwner: string;
};

export type AcquireBlsHttpWorkflowLockInput = {
  workflowId: string;
  /** When omitted, a new opaque owner token is generated. */
  lockOwner?: string;
};

export type BlsHttpWorkflowLockOwnerInput = {
  workflowId: string;
  lockOwner: string;
};

export type ClaimDueBlsHttpWorkflowInput = {
  /** When omitted, a new opaque owner token is generated. */
  lockOwner?: string;
};

export type RecordBlsHttpWorkflowAttemptInput = {
  taskId: string;
  /**
   * Explicit attempt number; when omitted, next = max(existing)+1 (or 1).
   * Never store secrets / field values in any string field.
   */
  attemptNo?: number;
  outcome: BlsHttpWorkflowAttemptOutcome;
  errorClass?: BlsHttpWorkflowErrorClass | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  evidenceRelativePath?: string | null;
  startedAt?: Date;
  finishedAt?: Date | null;
};

export type RecordBlsHttpWorkflowAttemptResult = BlsHttpWorkflowAttempt;
