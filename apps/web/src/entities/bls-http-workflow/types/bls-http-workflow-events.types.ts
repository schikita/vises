/**
 * Events poll types for GET …/bls-http-workflow/:workflowId/events (DEC-001 / REQ-007).
 * Aligns with backend BlsHttpWorkflowEventOut / BlsHttpWorkflowEventsOut.
 */

/** Single append-only event row (payloadSafe never secrets). */
export type BlsHttpWorkflowEvent = {
  id: number
  eventType: string
  stepKey: string | null
  taskKey: string | null
  payloadSafe: Record<string, unknown>
  createdAt: string
}

/** GET …/events response. */
export type BlsHttpWorkflowEventsOut = {
  workflowId: string
  workflowStatus: string
  events: BlsHttpWorkflowEvent[]
  latestEventId: number | null
}

/** Query for fetchBlsHttpWorkflowEvents (sinceEventId required; limit optional). */
export type BlsHttpWorkflowEventsQuery = {
  sinceEventId: number
  limit?: number
}
