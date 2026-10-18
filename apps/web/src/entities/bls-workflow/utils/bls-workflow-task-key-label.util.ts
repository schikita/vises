import { BLS_WORKFLOW_TASK_KEY_LABEL_RU } from '../constants'

/** Russian label for task key; falls back to raw token. */
export const blsWorkflowTaskKeyLabel = (taskKey: string): string =>
  BLS_WORKFLOW_TASK_KEY_LABEL_RU[taskKey] ?? taskKey
