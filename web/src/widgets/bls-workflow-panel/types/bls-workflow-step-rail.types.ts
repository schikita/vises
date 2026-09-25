import type { BlsWorkflowStep } from '@/entities/bls-workflow'

/** Presentational props for REGISTER→BOOK step rail (REQ-002). */
export type BlsWorkflowStepRailRenderProps = {
  steps: BlsWorkflowStep[]
  currentStepKey: string | null
}
