import { BLS_WORKFLOW_STEP_KEY_LABEL_RU } from '../constants'

/** Russian label for step key; falls back to raw token. */
export const blsWorkflowStepKeyLabel = (stepKey: string): string =>
  BLS_WORKFLOW_STEP_KEY_LABEL_RU[stepKey] ?? stepKey
