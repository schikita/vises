import { BLS_WORKFLOW_EVENT_TYPE_LABEL_RU } from '../constants'

/** Russian label for eventType; unknown keys fall back to raw token. */
export const blsWorkflowEventTypeLabel = (eventType: string): string =>
  BLS_WORKFLOW_EVENT_TYPE_LABEL_RU[eventType] ?? eventType
