import type { ClientDetailDto } from '@vises/contracts'
import { apiRequest } from '../http-client'

/** Typed skeleton: `GET /clients/:clientId` → Decision 2A `ClientDetailDto`. */
export const fetchClientDetail = (clientId: string): Promise<ClientDetailDto> =>
  apiRequest<ClientDetailDto>(`/clients/${clientId}`)
