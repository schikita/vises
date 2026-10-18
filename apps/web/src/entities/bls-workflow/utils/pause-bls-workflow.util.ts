import { apiRequest } from '@/shared/api'
import type { BlsWorkflowControlResult } from '../types'

/** POST pause active workflow (cooperative stop after current attempt). */
export const pauseBlsWorkflow = (
  applicationId: string,
  workflowId: string,
): Promise<BlsWorkflowControlResult> =>
  apiRequest<BlsWorkflowControlResult>(
    `/apps/${encodeURIComponent(applicationId)}/bls-workflow/${encodeURIComponent(workflowId)}/pause`,
    { method: 'POST' },
  )
