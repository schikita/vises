import type { BlsWorkflowEvent } from '@/entities/bls-workflow'

/** Presentational props for compact chronological events feed (DEC-006). */
export type BlsWorkflowEventsFeedRenderProps = {
  events: BlsWorkflowEvent[]
  /** Opens RegisterUser screenshot for AUTOFILL_RUN_LINKED (DEC-007). */
  onAutofillRunLinked?: (runId: string) => void | Promise<void>
}
