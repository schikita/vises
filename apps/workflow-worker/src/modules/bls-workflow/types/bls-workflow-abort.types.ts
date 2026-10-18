/**
 * Process-local abort registry types (DEC-001).
 * Force-close hooks must be idempotent and never log secrets.
 */

/** Close / teardown hook registered for an in-flight attempt. */
export type BlsWorkflowAbortCloseHook = () => Promise<void>;

/** Per-workflow attempt entry held by `BlsWorkflowAbortRegistry`. */
export type BlsWorkflowAbortAttemptEntry = {
  generation: number;
  controller: AbortController;
  closeHooks: BlsWorkflowAbortCloseHook[];
};
