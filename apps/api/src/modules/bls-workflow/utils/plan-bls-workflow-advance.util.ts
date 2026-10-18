import { BLS_WORKFLOW_STEP_KEY } from '../constants/bls-workflow.constants';
import type {
  BlsWorkflowAdvancePlan,
  BlsWorkflowStepCursorRow,
  BlsWorkflowTaskCursorRow,
} from '../types/bls-workflow-graph.types';
import { isBlsWorkflowTaskDoneStatus } from './is-bls-workflow-task-done-status.util';

/**
 * Pure plan: after `completedTaskId` is COMPLETED, pick next READY cursor
 * or BOOK success terminal (DEC-010).
 */
export const planBlsWorkflowAdvance = (input: {
  steps: BlsWorkflowStepCursorRow[];
  tasks: BlsWorkflowTaskCursorRow[];
  completedTaskId: string;
}): BlsWorkflowAdvancePlan => {
  const steps = [...input.steps].sort((a, b) => a.ordinal - b.ordinal);
  const tasks = [...input.tasks].sort((a, b) => a.ordinal - b.ordinal);
  const completed = tasks.find((t) => t.id === input.completedTaskId);
  if (!completed) {
    return {
      completedStepId: null,
      nextTaskId: null,
      nextStepKey: null,
      nextTaskKey: null,
      bookSuccessTerminal: false,
    };
  }

  const step = steps.find((s) => s.id === completed.stepId);
  if (!step) {
    return {
      completedStepId: null,
      nextTaskId: null,
      nextStepKey: null,
      nextTaskKey: null,
      bookSuccessTerminal: false,
    };
  }

  const openInStep = tasks
    .filter(
      (t) =>
        t.stepId === step.id &&
        t.id !== completed.id &&
        !isBlsWorkflowTaskDoneStatus(t.status),
    )
    .sort((a, b) => a.ordinal - b.ordinal);

  if (openInStep.length > 0) {
    const next = openInStep[0]!;
    return {
      completedStepId: null,
      nextTaskId: next.id,
      nextStepKey: step.stepKey,
      nextTaskKey: next.taskKey,
      bookSuccessTerminal: false,
    };
  }

  const nextStep = steps.find(
    (s) =>
      s.ordinal > step.ordinal &&
      tasks.some(
        (t) => t.stepId === s.id && !isBlsWorkflowTaskDoneStatus(t.status),
      ),
  );

  if (nextStep) {
    const nextTask = tasks
      .filter(
        (t) =>
          t.stepId === nextStep.id && !isBlsWorkflowTaskDoneStatus(t.status),
      )
      .sort((a, b) => a.ordinal - b.ordinal)[0]!;
    return {
      completedStepId: step.id,
      nextTaskId: nextTask.id,
      nextStepKey: nextStep.stepKey,
      nextTaskKey: nextTask.taskKey,
      bookSuccessTerminal: false,
    };
  }

  return {
    completedStepId: step.id,
    nextTaskId: null,
    nextStepKey: null,
    nextTaskKey: null,
    bookSuccessTerminal: step.stepKey === BLS_WORKFLOW_STEP_KEY.BOOK,
  };
};
