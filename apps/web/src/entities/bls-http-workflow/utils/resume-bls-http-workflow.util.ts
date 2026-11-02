import { apiRequest } from '@/shared/api'
import type { BlsHttpWorkflowControlResult } from '../types'

/** POST resume paused / waiting workflow (schedule now, no attempt reset). */
export const resumeBlsHttpWorkflow = (
  applicationId: string,
  workflowId: string,
): Promise<BlsHttpWorkflowControlResult> =>
  apiRequest<BlsHttpWorkflowControlResult>(
    `/apps/${encodeURIComponent(applicationId)}/bls-http-workflow/${encodeURIComponent(workflowId)}/resume`,
    { method: 'POST' },
  )
