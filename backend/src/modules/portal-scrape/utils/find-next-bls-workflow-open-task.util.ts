import type {
  BlsWorkflowStepCursorRow,
  BlsWorkflowTaskCursorRow,
} from '../types/bls-workflow-graph.types';
import { isBlsWorkflowTaskDoneStatus } from './is-bls-workflow-task-done-status.util';

/**
 * Next open task after a finished step ordinal (skip / empty-step advance).
 */
export const findNextBlsWorkflowOpenTask = (input: {
  steps: BlsWorkflowStepCursorRow[];
  tasks: BlsWorkflowTaskCursorRow[];
  afterStepOrdinal: number;
}): {
  taskId: string;
  taskKey: string;
  stepKey: string;
  stepId: string;
} | null => {
  const steps = [...input.steps]
    .filter((s) => s.ordinal > input.afterStepOrdinal)
    .sort((a, b) => a.ordinal - b.ordinal);

  for (const step of steps) {
    const nextTask = [...input.tasks]
      .filter(
        (t) =>
          t.stepId === step.id && !isBlsWorkflowTaskDoneStatus(t.status),
      )
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
