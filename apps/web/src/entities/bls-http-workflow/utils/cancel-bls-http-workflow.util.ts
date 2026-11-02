import { apiRequest } from '@/shared/api'
import type { BlsHttpWorkflowControlResult } from '../types'

/** POST cancel non-terminal workflow. */
export const cancelBlsHttpWorkflow = (
  applicationId: string,
  workflowId: string,
): Promise<BlsHttpWorkflowControlResult> =>
  apiRequest<BlsHttpWorkflowControlResult>(
    `/apps/${encodeURIComponent(applicationId)}/bls-http-workflow/${encodeURIComponent(workflowId)}/cancel`,
    { method: 'POST' },
  )
