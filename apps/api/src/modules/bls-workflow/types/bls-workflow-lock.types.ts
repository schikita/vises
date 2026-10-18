import type { BlsWorkflow } from '../../database/entities/bls-workflow.entity';
import type { BlsWorkflowAttempt } from '../../database/entities/bls-workflow-attempt.entity';
import type {
  BlsWorkflowAttemptOutcome,
  BlsWorkflowErrorClass,
} from './bls-workflow.types';

/** Typed live-lock / lock-path conflict for HTTP mapping (REQ-005). */
export type BlsWorkflowLockErrorCode = 'live_lock' | 'not_found';

export type CreateBlsWorkflowLockErrorInput = {
  code: BlsWorkflowLockErrorCode;
  message: string;
  httpStatus?: number;
};

export type BlsWorkflowLockError = Error & {
  name: 'BlsWorkflowLockError';
  code: BlsWorkflowLockErrorCode;
  httpStatus: number;
};

/** Result of a successful lock acquire / claim. */
export type BlsWorkflowLockLease = {
  workflow: BlsWorkflow;
  lockOwner: string;
};

export type AcquireBlsWorkflowLockInput = {
  workflowId: string;
  /** When omitted, a new opaque owner token is generated. */
  lockOwner?: string;
};

export type BlsWorkflowLockOwnerInput = {
  workflowId: string;
  lockOwner: string;
};

export type ClaimDueBlsWorkflowInput = {
  /** When omitted, a new opaque owner token is generated. */
  lockOwner?: string;
};

export type RecordBlsWorkflowAttemptInput = {
  taskId: string;
  /**
   * Explicit attempt number; when omitted, next = max(existing)+1 (or 1).
   * Never store secrets / field values in any string field.
   */
  attemptNo?: number;
  outcome: BlsWorkflowAttemptOutcome;
  errorClass?: BlsWorkflowErrorClass | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  evidenceRelativePath?: string | null;
  startedAt?: Date;
  finishedAt?: Date | null;
};

export type RecordBlsWorkflowAttemptResult = BlsWorkflowAttempt;
