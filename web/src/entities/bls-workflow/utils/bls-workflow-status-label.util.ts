import { BLS_WORKFLOW_STATUS_LABEL_RU } from '../constants'

/** Russian label for workflow status; falls back to raw token. */
export const blsWorkflowStatusLabel = (status: string): string =>
  BLS_WORKFLOW_STATUS_LABEL_RU[status] ?? status
