import type { BlsWorkflowSafeError, BlsWorkflowSnapshot } from '../types'
import { findBlsWorkflowCurrentTask } from './find-bls-workflow-current-task.util'

/**
 * Last safe error from current task (lastErrorMessage / lastErrorClass only).
 * Never surfaces secrets.
 */
export const findBlsWorkflowSafeError = (
  snapshot: BlsWorkflowSnapshot,
): BlsWorkflowSafeError | null => {
  const task = findBlsWorkflowCurrentTask(snapshot)
  if (task == null) return null
  if (task.lastErrorMessage == null && task.lastErrorClass == null) return null
  return {
    errorClass: task.lastErrorClass,
    errorMessage: task.lastErrorMessage,
    taskKey: task.taskKey,
  }
}
