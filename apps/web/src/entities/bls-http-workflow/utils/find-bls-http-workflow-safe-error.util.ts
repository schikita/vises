import type { BlsHttpWorkflowSafeError, BlsHttpWorkflowSnapshot } from '../types'
import { findBlsHttpWorkflowCurrentTask } from './find-bls-http-workflow-current-task.util'

/**
 * Last safe error from current task (lastErrorMessage / lastErrorClass only).
 * Never surfaces secrets.
 */
export const findBlsHttpWorkflowSafeError = (
  snapshot: BlsHttpWorkflowSnapshot,
): BlsHttpWorkflowSafeError | null => {
  const task = findBlsHttpWorkflowCurrentTask(snapshot)
  if (task == null) return null
  if (task.lastErrorMessage == null && task.lastErrorClass == null) return null
  return {
    errorClass: task.lastErrorClass,
    errorCode: task.lastErrorCode ?? null,
    errorMessage: task.lastErrorMessage,
    taskKey: task.taskKey,
  }
}
