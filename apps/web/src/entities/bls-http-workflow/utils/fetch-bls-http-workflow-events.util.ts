import { apiRequest } from '@/shared/api'
import { BLS_WORKFLOW_EVENTS_DEFAULT_LIMIT, BLS_WORKFLOW_EVENTS_MAX_LIMIT } from '../constants'
import type { BlsHttpWorkflowEventsOut, BlsHttpWorkflowEventsQuery } from '../types'

/**
 * GET incremental workflow events for poll cursor (DEC-001 / REQ-007).
 * Clamps limit to backend max; defaults when omitted.
 */
export const fetchBlsHttpWorkflowEvents = (
  applicationId: string,
  workflowId: string,
  query: BlsHttpWorkflowEventsQuery,
): Promise<BlsHttpWorkflowEventsOut> => {
  const rawLimit = query.limit ?? BLS_WORKFLOW_EVENTS_DEFAULT_LIMIT
  const limit = Math.min(
    Math.max(1, Math.floor(rawLimit)),
    BLS_WORKFLOW_EVENTS_MAX_LIMIT,
  )
  const sinceEventId = Number.isFinite(query.sinceEventId)
    ? Math.max(0, Math.floor(query.sinceEventId))
    : 0
  const params = new URLSearchParams({
    sinceEventId: String(sinceEventId),
    limit: String(limit),
  })

  return apiRequest<BlsHttpWorkflowEventsOut>(
    `/apps/${encodeURIComponent(applicationId)}/bls-http-workflow/${encodeURIComponent(workflowId)}/events?${params.toString()}`,
  )
}
