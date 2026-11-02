import type {
  BlsHttpWorkflowApplicantLabelSource,
  BlsHttpWorkflowTask,
} from '@/entities/bls-http-workflow'

/** Presentational props for task list + optional targeted retry (REQ-003, REQ-010, REQ-011). */
export type BlsHttpWorkflowTaskListRenderProps = {
  tasks: BlsHttpWorkflowTask[]
  /** Task id from fixed `findBlsHttpWorkflowCurrentTask` (FE-TASK-002). */
  currentTaskId: string | null
  applicants?: BlsHttpWorkflowApplicantLabelSource[]
  busy: boolean
  /** Task ids eligible for per-row Retry (`taskId` body). */
  retryableTaskIds: ReadonlySet<string>
  onRetryTask: (taskId: string) => void
}
