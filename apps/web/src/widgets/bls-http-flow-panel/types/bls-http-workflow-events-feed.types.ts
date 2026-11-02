import type { BlsHttpWorkflowEvent } from '@/entities/bls-http-workflow'

/** Presentational props for compact chronological events feed (DEC-006). */
export type BlsHttpWorkflowEventsFeedRenderProps = {
  events: BlsHttpWorkflowEvent[]
  /** Opens RegisterUser screenshot for AUTOFILL_RUN_LINKED (DEC-007). */
  onAutofillRunLinked?: (runId: string) => void | Promise<void>
}
