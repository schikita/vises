/**
 * Allowlisted display shape for event payloadSafe (REQ-016 / REQ-017).
 * Only scalar-safe fields; never nested dumps.
 */

/** Operator-safe scalars that may appear in the events timeline. */
export type BlsWorkflowPayloadSafeDisplay = {
  runId?: string
  status?: string
  action?: string
  taskId?: string
  reason?: string
  errorClass?: string
  errorCode?: string
  errorMessage?: string
  terminalWorkflow?: boolean
  created?: boolean
}
