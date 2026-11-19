import type { ClientListDto } from '@vises/contracts'
import { apiRequest } from '@/shared/api'

/** GET /clients → `ClientListDto[]` (SoT; no query pagination). */
export const fetchClientsList = (): Promise<ClientListDto[]> =>
  apiRequest<ClientListDto[]>('/clients')
