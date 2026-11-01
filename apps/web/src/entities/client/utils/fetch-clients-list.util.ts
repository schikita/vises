import type { ClientListDto } from '@vises/contracts'
import { apiRequest } from '@/shared/api'

/** GET /clients → Decision 2A `ClientListDto[]` (maskedPassport only). */
export const fetchClientsList = (): Promise<ClientListDto[]> =>
  apiRequest<ClientListDto[]>('/clients')
