import type { BlsWorkflowSnapshot, BlsWorkflowTask } from '../types'

/** Resolve current task row from snapshot cursor keys. */
export const findBlsWorkflowCurrentTask = (
  snapshot: BlsWorkflowSnapshot,
): BlsWorkflowTask | null => {
  const { currentStepKey, currentTaskKey, tasks } = snapshot
  if (currentStepKey == null || currentTaskKey == null) return null
  return (
    tasks.find(
      (task) =>
        task.stepKey === currentStepKey && task.taskKey === currentTaskKey,
    ) ?? null
  )
}
