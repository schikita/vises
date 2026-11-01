import type { ApplicationStatusHistoryResponseDto } from '@vises/contracts'
import { apiRequest } from '../http-client'

/**
 * Typed skeleton: `GET /applications/:applicationId/history`
 * → Decision 1A / 2A `ApplicationStatusHistoryResponseDto`.
 */
export const fetchApplicationStatusHistory = (
  applicationId: string,
): Promise<ApplicationStatusHistoryResponseDto> =>
  apiRequest<ApplicationStatusHistoryResponseDto>(
    `/applications/${applicationId}/history`,
  )
