import { isBlsWorkflowErrorClassSafeToRepeat } from './is-bls-workflow-error-class-safe-to-repeat.util';
import { isBlsWorkflowErrorClassVerifyThenRepeat } from './is-bls-workflow-error-class-verify-then-repeat.util';

/**
 * SAFE_TO_REPEAT or VERIFY_THEN_REPEAT may auto-retry (DEC-004).
 * NOT_SAFE_TO_REPEAT never auto-retries.
 */
export const isBlsWorkflowErrorClassAutoRetryable = (
  errorClass: string,
): boolean =>
  isBlsWorkflowErrorClassSafeToRepeat(errorClass) ||
  isBlsWorkflowErrorClassVerifyThenRepeat(errorClass);
