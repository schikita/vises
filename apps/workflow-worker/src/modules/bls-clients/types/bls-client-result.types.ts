import type { BlsWorkflowErrorClass } from '../../bls-workflow/types/bls-workflow.types';

/** Soft-link metadata so the workflow executor can append AUTOFILL_RUN_LINKED. */
export type BlsAutofillRunLinkedMetadata = {
  runId: string;
  stepId: string;
  created: boolean;
};

/** Executor reported success after external verify (REQ-007). */
export type BlsClientSuccess = {
  ok: true;
  verifiedExternalState: true;
  autofillRunLinked?: BlsAutofillRunLinkedMetadata;
};

/**
 * Conditional step not applicable (REQ-012 PASSWORD_CHANGE).
 * Dispatcher/orchestrator marks step SKIPPED — not a failure.
 */
export type BlsClientSkipped = {
  ok: false;
  skipped: true;
  skipReason: string;
  autofillRunLinked?: BlsAutofillRunLinkedMetadata;
};

/** Executor reported failure with DEC-004 error class (safe strings only). */
export type BlsClientFailure = {
  ok: false;
  skipped?: false;
  errorClass: BlsWorkflowErrorClass;
  errorCode?: string | null;
  errorMessage?: string | null;
  evidenceRelativePath?: string | null;
  autofillRunLinked?: BlsAutofillRunLinkedMetadata;
};

/**
 * Structured domain-client outcome — mirrors executor result so the dispatcher
 * can return client results (minus link metadata) unchanged (REQ-007).
 */
export type BlsClientResult =
  | BlsClientSuccess
  | BlsClientSkipped
  | BlsClientFailure;
