import { computeBlsHttpWorkflowRetryBackoffMs } from './compute-bls-http-workflow-retry-backoff-ms.util';

/**
 * Schedule workflow `nextRunAt` after a failed auto-retryable attempt (DEC-014).
 */
export const computeBlsHttpWorkflowNextRunAt = (input: {
  attemptNo: number;
  now?: Date;
}): Date => {
  const now = input.now ?? new Date();
  const delayMs = computeBlsHttpWorkflowRetryBackoffMs(input.attemptNo);
  return new Date(now.getTime() + delayMs);
};
