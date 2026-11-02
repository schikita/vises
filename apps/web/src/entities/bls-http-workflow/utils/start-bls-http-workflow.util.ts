import { apiRequest } from '@/shared/api'
import type { StartBlsHttpWorkflowBody, BlsHttpWorkflowSnapshot } from '../types'

/**
 * POST start (arm) the HTTP-engine workflow for an application.
 * `supersede: true` abandons the active workflow and creates a new graph;
 * default `ensure` is idempotent (no 409 when an active workflow exists).
 * Server-side start gate (completeness + travel date) applies.
 */
export const startBlsHttpWorkflow = (
  applicationId: string,
  body: StartBlsHttpWorkflowBody = {},
): Promise<BlsHttpWorkflowSnapshot> =>
  apiRequest<BlsHttpWorkflowSnapshot>(
    `/apps/${encodeURIComponent(applicationId)}/bls-http-workflow/start`,
    { method: 'POST', data: body },
  )
