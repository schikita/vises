import {
  BLS_WORKFLOW_TASK_STATUS,
} from '../constants/bls-workflow.constants';
import type {
  BlsWorkflowStepCursorRow,
  BlsWorkflowTaskCursorRow,
} from '../types/bls-workflow-graph.types';

/**
 * First runnable task in step/task ordinal order after a due claim.
 * Includes READY, RUNNING (mid-attempt), and WAITING (scheduled retry).
 */
export const findCurrentBlsWorkflowReadyTask = (input: {
  steps: BlsWorkflowStepCursorRow[];
  tasks: BlsWorkflowTaskCursorRow[];
}): {
  taskId: string;
  taskKey: string;
  stepKey: string;
  stepId: string;
} | null => {
  const steps = [...input.steps].sort((a, b) => a.ordinal - b.ordinal);
  const runnable = new Set<string>([
    BLS_WORKFLOW_TASK_STATUS.READY,
    BLS_WORKFLOW_TASK_STATUS.RUNNING,
    BLS_WORKFLOW_TASK_STATUS.WAITING,
  ]);

  for (const step of steps) {
    const nextTask = [...input.tasks]
      .filter((t) => t.stepId === step.id && runnable.has(t.status))
      .sort((a, b) => a.ordinal - b.ordinal)[0];
    if (nextTask) {
      return {
        taskId: nextTask.id,
        taskKey: nextTask.taskKey,
        stepKey: step.stepKey,
        stepId: step.id,
      };
    }
  }
  return null;
};
