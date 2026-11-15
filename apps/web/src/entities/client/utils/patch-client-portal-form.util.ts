import type {
  ClientPortalFormDetailDto,
  ClientPortalFormUpdateDto,
} from '@vises/contracts'
import { apiRequest } from '@/shared/api'

/**
 * PATCH /clients/:clientId/portal-form — partial portal-form write
 * (including journey/contact). Does not log body values (PII).
 */
export const patchClientPortalForm = (
  clientId: string,
  body: ClientPortalFormUpdateDto,
): Promise<ClientPortalFormDetailDto> =>
  apiRequest<ClientPortalFormDetailDto>(
    `/clients/${encodeURIComponent(clientId)}/portal-form`,
    { method: 'PATCH', data: body },
  )
