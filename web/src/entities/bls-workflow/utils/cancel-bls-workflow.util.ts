import { apiRequest } from '@/shared/api'
import type { BlsWorkflowControlResult } from '../types'

/** POST cancel non-terminal workflow. */
export const cancelBlsWorkflow = (
  applicationId: string,
  workflowId: string,
): Promise<BlsWorkflowControlResult> =>
  apiRequest<BlsWorkflowControlResult>(
    `/apps/${encodeURIComponent(applicationId)}/bls-workflow/${encodeURIComponent(workflowId)}/cancel`,
    { method: 'POST' },
  )
