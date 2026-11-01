import type { ClientListDto } from '@vises/contracts'
import { apiRequest } from '../http-client'

/** Typed skeleton: `GET /clients` → Decision 2A `ClientListDto[]` (masked passport). */
export const fetchClientsList = (): Promise<ClientListDto[]> =>
  apiRequest<ClientListDto[]>('/clients')
