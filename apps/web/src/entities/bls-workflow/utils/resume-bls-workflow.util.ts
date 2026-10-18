import { apiRequest } from '@/shared/api'
import type { BlsWorkflowControlResult } from '../types'

/** POST resume paused / waiting workflow (schedule now, no attempt reset). */
export const resumeBlsWorkflow = (
  applicationId: string,
  workflowId: string,
): Promise<BlsWorkflowControlResult> =>
  apiRequest<BlsWorkflowControlResult>(
    `/apps/${encodeURIComponent(applicationId)}/bls-workflow/${encodeURIComponent(workflowId)}/resume`,
    { method: 'POST' },
  )
