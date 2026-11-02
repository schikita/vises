import { apiRequest } from '@/shared/api'
import type { BlsHttpWorkflowControlResult } from '../types'

/** POST pause active workflow (cooperative stop after current attempt). */
export const pauseBlsHttpWorkflow = (
  applicationId: string,
  workflowId: string,
): Promise<BlsHttpWorkflowControlResult> =>
  apiRequest<BlsHttpWorkflowControlResult>(
    `/apps/${encodeURIComponent(applicationId)}/bls-http-workflow/${encodeURIComponent(workflowId)}/pause`,
    { method: 'POST' },
  )
