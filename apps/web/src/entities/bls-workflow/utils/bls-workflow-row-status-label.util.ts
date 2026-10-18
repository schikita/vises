import { BLS_WORKFLOW_ROW_STATUS_LABEL_RU } from '../constants'

/** Russian label for step/task row status; falls back to raw token. */
export const blsWorkflowRowStatusLabel = (status: string): string =>
  BLS_WORKFLOW_ROW_STATUS_LABEL_RU[status] ?? status
