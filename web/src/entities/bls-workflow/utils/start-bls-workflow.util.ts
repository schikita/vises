import { apiRequest } from '@/shared/api'
import type { StartBlsWorkflowBody, StartBlsWorkflowResult } from '../types'

/** POST start workflow; optional supersede abandons active prior (DEC-013). */
export const startBlsWorkflow = (
  applicationId: string,
  body: StartBlsWorkflowBody = {},
): Promise<StartBlsWorkflowResult> =>
  apiRequest<StartBlsWorkflowResult>(
    `/apps/${encodeURIComponent(applicationId)}/bls-workflow`,
    { method: 'POST', data: body },
  )
