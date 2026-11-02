import { BLS_WORKFLOW_ERROR_CLASS } from '../constants/bls-http-workflow.constants';

/**
 * Whether failure class forbids auto-retry (DEC-004).
 * Runner must gate to WAITING_STAFF — never schedule nextRunAt.
 */
export const isBlsHttpWorkflowErrorClassNotSafeToRepeat = (
  errorClass: string,
): boolean => errorClass === BLS_WORKFLOW_ERROR_CLASS.NOT_SAFE_TO_REPEAT;
