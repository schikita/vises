import { apiRequest } from '@/shared/api'
import type { BlsHttpWorkflowControlResult, RetryBlsHttpWorkflowBody } from '../types'

/** POST manual retry for workflow (resets attempt budget, schedules now). */
export const retryBlsHttpWorkflow = (
  applicationId: string,
  workflowId: string,
  body: RetryBlsHttpWorkflowBody = {},
): Promise<BlsHttpWorkflowControlResult> =>
  apiRequest<BlsHttpWorkflowControlResult>(
    `/apps/${encodeURIComponent(applicationId)}/bls-http-workflow/${encodeURIComponent(workflowId)}/retry`,
    { method: 'POST', data: body },
  )
