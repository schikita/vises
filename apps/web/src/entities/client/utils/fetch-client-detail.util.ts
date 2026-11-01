import type { ClientDetailDto } from '@vises/contracts'
import { apiRequest } from '@/shared/api'

/** GET /clients/:clientId → Decision 2A `ClientDetailDto` (plaintext FR-6). */
export const fetchClientDetail = (clientId: string): Promise<ClientDetailDto> =>
  apiRequest<ClientDetailDto>(`/clients/${encodeURIComponent(clientId)}`)
