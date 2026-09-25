import type {
  BlsWorkflowApplicantLabelSource,
  BlsWorkflowTask,
} from '@/entities/bls-workflow'

/** Presentational props for task list + optional targeted retry (REQ-003, REQ-010, REQ-011). */
export type BlsWorkflowTaskListRenderProps = {
  tasks: BlsWorkflowTask[]
  /** Task id from fixed `findBlsWorkflowCurrentTask` (FE-TASK-002). */
  currentTaskId: string | null
  applicants?: BlsWorkflowApplicantLabelSource[]
  busy: boolean
  /** Task ids eligible for per-row Retry (`taskId` body). */
  retryableTaskIds: ReadonlySet<string>
  onRetryTask: (taskId: string) => void
}
