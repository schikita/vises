import type { BlsHttpWorkflowStep } from '@/entities/bls-http-workflow'

/** Presentational props for REGISTER→BOOK step rail (REQ-002). */
export type BlsHttpWorkflowStepRailRenderProps = {
  steps: BlsHttpWorkflowStep[]
  currentStepKey: string | null
}
