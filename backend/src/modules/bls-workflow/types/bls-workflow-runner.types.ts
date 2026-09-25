import type { BlsWorkflowErrorClass } from './bls-workflow.types';

/** Input passed from runner to the injected task executor (DEC-002 / DEC-008). */
export type BlsWorkflowTaskExecutorInput = {
  workflowId: string;
  applicationId: string;
  stepId: string;
  stepKey: string;
  taskId: string;
  taskKey: string;
  applicantId: string | null;
  /** 1-based attempt number for this execution. */
  attemptNo: number;
  /**
   * In-flight abort signal from `BlsWorkflowAbortRegistry.beginAttempt`
   * (bls-workflow-immediate-stop DEC-001).
   */
  abortSignal?: AbortSignal;
};

/** Executor reported success after external verify (REQ-007). */
export type BlsWorkflowTaskExecutorSuccess = {
  ok: true;
  /** Must be true — runner refuses COMPLETED without verify. */
  verifiedExternalState: true;
};

/**
 * Conditional step not applicable (REQ-012 PASSWORD_CHANGE).
 * Dispatcher/orchestrator marks step SKIPPED — not a failure.
 */
export type BlsWorkflowTaskExecutorSkipped = {
  ok: false;
  skipped: true;
  skipReason: string;
};

/** Executor reported failure with DEC-004 error class (safe strings only). */
export type BlsWorkflowTaskExecutorFailure = {
  ok: false;
  skipped?: false;
  errorClass: BlsWorkflowErrorClass;
  errorCode?: string | null;
  errorMessage?: string | null;
  evidenceRelativePath?: string | null;
};

export type BlsWorkflowTaskExecutorResult =
  | BlsWorkflowTaskExecutorSuccess
  | BlsWorkflowTaskExecutorSkipped
  | BlsWorkflowTaskExecutorFailure;
