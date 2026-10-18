import { BLS_WORKFLOW_TASK_STATUS } from '../constants/bls-workflow.constants';
import type { BlsWorkflowManualRetryTaskRow } from '../types/bls-workflow-api.types';

/**
 * Resolve task for staff manual retry: explicit taskId, else current failed/waiting,
 * else first failed/waiting by ordinal.
 */
export const resolveBlsWorkflowManualRetryTask = (input: {
  tasks: BlsWorkflowManualRetryTaskRow[];
  currentTaskKey: string | null;
  taskId?: string | null;
}): BlsWorkflowManualRetryTaskRow | null => {
  const retryable = new Set<string>([
    BLS_WORKFLOW_TASK_STATUS.FAILED,
    BLS_WORKFLOW_TASK_STATUS.WAITING,
  ]);

  if (input.taskId != null && input.taskId.trim() !== '') {
    const byId = input.tasks.find((t) => t.id === input.taskId);
    return byId ?? null;
  }

  if (input.currentTaskKey != null && input.currentTaskKey !== '') {
    const current = input.tasks.find(
      (t) => t.taskKey === input.currentTaskKey && retryable.has(t.status),
    );
    if (current) {
      return current;
    }
  }

  const candidates = input.tasks
    .filter((t) => retryable.has(t.status))
    .sort((a, b) => a.ordinal - b.ordinal);
  return candidates[0] ?? null;
};
