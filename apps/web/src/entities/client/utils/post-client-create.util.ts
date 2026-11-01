import type { ClientCreateDto, ClientDto } from '@vises/contracts'
import { apiRequest } from '@/shared/api'

/** POST /clients — agent-only; may return `insufficient_balance`. */
export const postClientCreate = (body: ClientCreateDto): Promise<ClientDto> =>
  apiRequest<ClientDto>('/clients', {
    method: 'POST',
    data: body,
  })
