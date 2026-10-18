import { apiRequest } from '@/shared/api'
import type { BlsWorkflowControlResult, RetryBlsWorkflowBody } from '../types'

/** POST manual retry for workflow (resets attempt budget, schedules now). */
export const retryBlsWorkflow = (
  applicationId: string,
  workflowId: string,
  body: RetryBlsWorkflowBody = {},
): Promise<BlsWorkflowControlResult> =>
  apiRequest<BlsWorkflowControlResult>(
    `/apps/${encodeURIComponent(applicationId)}/bls-workflow/${encodeURIComponent(workflowId)}/retry`,
    { method: 'POST', data: body },
  )
