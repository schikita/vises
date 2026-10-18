/**
 * Allowlisted payloadSafe keys for staff display (REQ-016 / REQ-017).
 * Never dump full payloadSafe; never include secret-bearing keys.
 */
export const BLS_WORKFLOW_PAYLOAD_SAFE_DISPLAY_KEYS = [
  'runId',
  'status',
  'action',
  'taskId',
  'reason',
  'errorClass',
  'errorCode',
  'errorMessage',
  'terminalWorkflow',
  'created',
] as const
