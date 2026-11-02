import { BLS_WORKFLOW_ERROR_CLASS } from '../constants/bls-http-workflow.constants';

/**
 * Whether failure class allows auto-retry only after external verify (DEC-004).
 * Side effect may have happened; re-nav + verify before re-click.
 */
export const isBlsHttpWorkflowErrorClassVerifyThenRepeat = (
  errorClass: string,
): boolean => errorClass === BLS_WORKFLOW_ERROR_CLASS.VERIFY_THEN_REPEAT;
