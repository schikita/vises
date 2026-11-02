/**
 * Process-local abort registry types (DEC-001).
 * Force-close hooks must be idempotent and never log secrets.
 */

/** Close / teardown hook registered for an in-flight attempt. */
export type BlsHttpWorkflowAbortCloseHook = () => Promise<void>;

/** Per-workflow attempt entry held by `BlsHttpWorkflowAbortRegistry`. */
export type BlsHttpWorkflowAbortAttemptEntry = {
  generation: number;
  controller: AbortController;
  closeHooks: BlsHttpWorkflowAbortCloseHook[];
};
