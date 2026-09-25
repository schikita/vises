/**
 * Events poll types for GET …/bls-workflow/:workflowId/events (DEC-001 / REQ-007).
 * Aligns with backend BlsWorkflowEventOut / BlsWorkflowEventsOut.
 */

/** Single append-only event row (payloadSafe never secrets). */
export type BlsWorkflowEvent = {
  id: number
  eventType: string
  stepKey: string | null
  taskKey: string | null
  payloadSafe: Record<string, unknown>
  createdAt: string
}

/** GET …/events response. */
export type BlsWorkflowEventsOut = {
  workflowId: string
  workflowStatus: string
  events: BlsWorkflowEvent[]
  latestEventId: number | null
}

/** Query for fetchBlsWorkflowEvents (sinceEventId required; limit optional). */
export type BlsWorkflowEventsQuery = {
  sinceEventId: number
  limit?: number
}
