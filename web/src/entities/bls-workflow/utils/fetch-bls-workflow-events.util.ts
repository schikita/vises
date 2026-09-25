import { apiRequest } from '@/shared/api'
import { BLS_WORKFLOW_EVENTS_DEFAULT_LIMIT, BLS_WORKFLOW_EVENTS_MAX_LIMIT } from '../constants'
import type { BlsWorkflowEventsOut, BlsWorkflowEventsQuery } from '../types'

/**
 * GET incremental workflow events for poll cursor (DEC-001 / REQ-007).
 * Clamps limit to backend max; defaults when omitted.
 */
export const fetchBlsWorkflowEvents = (
  applicationId: string,
  workflowId: string,
  query: BlsWorkflowEventsQuery,
): Promise<BlsWorkflowEventsOut> => {
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

  return apiRequest<BlsWorkflowEventsOut>(
    `/apps/${encodeURIComponent(applicationId)}/bls-workflow/${encodeURIComponent(workflowId)}/events?${params.toString()}`,
  )
}
