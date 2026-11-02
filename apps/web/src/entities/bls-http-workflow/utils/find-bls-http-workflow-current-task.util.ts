import { BLS_WORKFLOW_TASK_STATUS } from '../constants'
import type { BlsHttpWorkflowSnapshot, BlsHttpWorkflowTask } from '../types'

/**
 * Status preference when multiple tasks share stepKey + taskKey
 * (e.g. multi-applicant STATUS_APPLICANT — REQ-012 / DEC-004).
 * Snapshot cursor has no applicantId; prefer active/waiting rows, then lowest ordinal.
 */
const CURRENT_TASK_STATUS_RANK: Record<string, number> = {
  [BLS_WORKFLOW_TASK_STATUS.RUNNING]: 0,
  [BLS_WORKFLOW_TASK_STATUS.WAITING]: 1,
  [BLS_WORKFLOW_TASK_STATUS.READY]: 2,
  [BLS_WORKFLOW_TASK_STATUS.FAILED]: 3,
  [BLS_WORKFLOW_TASK_STATUS.PENDING]: 4,
  [BLS_WORKFLOW_TASK_STATUS.COMPLETED]: 5,
  [BLS_WORKFLOW_TASK_STATUS.SKIPPED]: 6,
}

/**
 * Resolve current task row from snapshot cursor keys.
 * Match precedence: stepKey + taskKey → best status rank → lowest ordinal.
 * Avoids first-match bug when duplicate taskKeys exist across applicants.
 */
export const findBlsHttpWorkflowCurrentTask = (
  snapshot: BlsHttpWorkflowSnapshot,
): BlsHttpWorkflowTask | null => {
  const { currentStepKey, currentTaskKey, tasks } = snapshot
  if (currentStepKey == null || currentTaskKey == null) return null

  const matches = tasks.filter(
    (task) =>
      task.stepKey === currentStepKey && task.taskKey === currentTaskKey,
  )
  if (matches.length === 0) return null
  if (matches.length === 1) return matches[0] ?? null

  const ranked = [...matches].sort((a, b) => {
    const rankA = CURRENT_TASK_STATUS_RANK[a.status] ?? 99
    const rankB = CURRENT_TASK_STATUS_RANK[b.status] ?? 99
    if (rankA !== rankB) return rankA - rankB
    return a.ordinal - b.ordinal
  })

  return ranked[0] ?? null
}
