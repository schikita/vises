import type { ApplicationStatusHistoryResponseDto } from '@vises/contracts'
import { apiRequest } from '@/shared/api'

/**
 * GET /applications/:applicationId/history → ApplicationStatusHistoryResponseDto
 * (Decision 1A / FE10 / AC-9). Items are oldest→newest; empty `{ items: [] }` OK.
 */
export const fetchApplicationStatusHistory = (
  applicationId: string,
): Promise<ApplicationStatusHistoryResponseDto> =>
  apiRequest<ApplicationStatusHistoryResponseDto>(
    `/applications/${encodeURIComponent(applicationId)}/history`,
  )
