import {
  BLS_WORKFLOW_ATTEMPT_OUTCOME,
  BLS_WORKFLOW_ERROR_CLASS,
  BLS_WORKFLOW_STATUS,
  BLS_WORKFLOW_STEP_KEY,
  BLS_WORKFLOW_STEP_STATUS,
  BLS_WORKFLOW_TASK_STATUS,
} from '../constants/bls-workflow.constants';

export type { BlsSecretPurpose } from '../../bls-secrets/types/bls-secret-purpose.types';

/** Workflow lifecycle status (REQ-001). */
export type BlsWorkflowStatus =
  (typeof BLS_WORKFLOW_STATUS)[keyof typeof BLS_WORKFLOW_STATUS];

/** Ordered step key (REGISTER…BOOK). */
export type BlsWorkflowStepKey =
  (typeof BLS_WORKFLOW_STEP_KEY)[keyof typeof BLS_WORKFLOW_STEP_KEY];

/** Step lifecycle status. */
export type BlsWorkflowStepStatus =
  (typeof BLS_WORKFLOW_STEP_STATUS)[keyof typeof BLS_WORKFLOW_STEP_STATUS];

/** Task lifecycle status. */
export type BlsWorkflowTaskStatus =
  (typeof BLS_WORKFLOW_TASK_STATUS)[keyof typeof BLS_WORKFLOW_TASK_STATUS];

/** Attempt outcome. */
export type BlsWorkflowAttemptOutcome =
  (typeof BLS_WORKFLOW_ATTEMPT_OUTCOME)[keyof typeof BLS_WORKFLOW_ATTEMPT_OUTCOME];

/** Retry error class (DEC-004); null on success. */
export type BlsWorkflowErrorClass =
  (typeof BLS_WORKFLOW_ERROR_CLASS)[keyof typeof BLS_WORKFLOW_ERROR_CLASS];
