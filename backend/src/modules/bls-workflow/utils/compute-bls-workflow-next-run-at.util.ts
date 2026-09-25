import { computeBlsWorkflowRetryBackoffMs } from './compute-bls-workflow-retry-backoff-ms.util';

/**
 * Schedule workflow `nextRunAt` after a failed auto-retryable attempt (DEC-014).
 */
export const computeBlsWorkflowNextRunAt = (input: {
  attemptNo: number;
  now?: Date;
}): Date => {
  const now = input.now ?? new Date();
  const delayMs = computeBlsWorkflowRetryBackoffMs(input.attemptNo);
  return new Date(now.getTime() + delayMs);
};
