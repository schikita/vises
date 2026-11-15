import type { ClientDto, ClientPassportUpdateDto } from '@vises/contracts'
import { apiRequest } from '@/shared/api'

/**
 * PATCH /clients/:clientId/passport — FR-6 passport/identity write.
 * Does not log body values (PII).
 */
export const patchClientPassport = (
  clientId: string,
  body: ClientPassportUpdateDto,
): Promise<ClientDto> =>
  apiRequest<ClientDto>(
    `/clients/${encodeURIComponent(clientId)}/passport`,
    { method: 'PATCH', data: body },
  )
