import { isBlsHttpWorkflowErrorClassSafeToRepeat } from './is-bls-http-workflow-error-class-safe-to-repeat.util';
import { isBlsHttpWorkflowErrorClassVerifyThenRepeat } from './is-bls-http-workflow-error-class-verify-then-repeat.util';

/**
 * SAFE_TO_REPEAT or VERIFY_THEN_REPEAT may auto-retry (DEC-004).
 * NOT_SAFE_TO_REPEAT never auto-retries.
 */
export const isBlsHttpWorkflowErrorClassAutoRetryable = (
  errorClass: string,
): boolean =>
  isBlsHttpWorkflowErrorClassSafeToRepeat(errorClass) ||
  isBlsHttpWorkflowErrorClassVerifyThenRepeat(errorClass);
