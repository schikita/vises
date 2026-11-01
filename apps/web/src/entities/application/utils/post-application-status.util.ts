import type {
  ApplicationDto,
  ApplicationStatusChangeDto,
} from '@vises/contracts'
import { apiRequest } from '@/shared/api'

/** POST /applications/:applicationId/status → ApplicationDto (FR-6 / AC-9). */
export const postApplicationStatus = (
  applicationId: string,
  body: ApplicationStatusChangeDto,
): Promise<ApplicationDto> =>
  apiRequest<ApplicationDto>(
    `/applications/${encodeURIComponent(applicationId)}/status`,
    {
      method: 'POST',
      data: body,
    },
  )
