import { BLS_WORKFLOW_ERROR_CLASS } from '../constants/bls-workflow.constants';

/** Whether failure class allows auto-retry without external verify gate (DEC-004). */
export const isBlsWorkflowErrorClassSafeToRepeat = (
  errorClass: string,
): boolean => errorClass === BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT;
