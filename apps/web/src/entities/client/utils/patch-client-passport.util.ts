import type { ClientDto, ClientPassportUpdateDto } from '@vises/contracts'
import { apiRequest } from '@/shared/api'

/** PATCH /clients/:clientId/passport — may return `passport_not_unlocked`. */
export const patchClientPassport = (
  clientId: string,
  body: ClientPassportUpdateDto,
): Promise<ClientDto> =>
  apiRequest<ClientDto>(`/clients/${encodeURIComponent(clientId)}/passport`, {
    method: 'PATCH',
    data: body,
  })
