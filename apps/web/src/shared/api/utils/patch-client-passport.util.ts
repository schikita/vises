import type { ClientDto, ClientPassportUpdateDto } from '@vises/contracts'
import { apiRequest } from '../http-client'

/** Typed skeleton: `PATCH /clients/:clientId/passport` with Decision 2A body. */
export const patchClientPassport = (
  clientId: string,
  body: ClientPassportUpdateDto,
): Promise<ClientDto> =>
  apiRequest<ClientDto>(`/clients/${clientId}/passport`, {
    method: 'PATCH',
    data: body,
  })
