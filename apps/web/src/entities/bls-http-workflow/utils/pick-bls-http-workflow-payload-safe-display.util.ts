import { BLS_WORKFLOW_PAYLOAD_SAFE_DISPLAY_KEYS } from '../constants'
import type { BlsHttpWorkflowPayloadSafeDisplay } from '../types'

/**
 * Pick allowlisted scalar fields from payloadSafe for staff UI (REQ-017).
 * Never returns nested objects; unknown keys are dropped.
 */
export const pickBlsHttpWorkflowPayloadSafeDisplay = (
  payloadSafe: Record<string, unknown> | null | undefined,
): BlsHttpWorkflowPayloadSafeDisplay => {
  if (payloadSafe == null || typeof payloadSafe !== 'object') {
    return {}
  }

  const out: BlsHttpWorkflowPayloadSafeDisplay = {}

  for (const key of BLS_WORKFLOW_PAYLOAD_SAFE_DISPLAY_KEYS) {
    if (!(key in payloadSafe)) continue
    const value = payloadSafe[key]

    switch (key) {
      case 'runId':
      case 'status':
      case 'action':
      case 'taskId':
      case 'reason':
      case 'errorClass':
      case 'errorCode':
      case 'errorMessage':
        if (typeof value === 'string') {
          out[key] = value
        }
        break
      case 'terminalWorkflow':
      case 'created':
        if (typeof value === 'boolean') {
          out[key] = value
        }
        break
      default:
        break
    }
  }

  return out
}
