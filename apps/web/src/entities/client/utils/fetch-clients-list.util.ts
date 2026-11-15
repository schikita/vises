import type { ClientListDto } from '@vises/contracts'
import { apiRequest } from '@/shared/api'

/**
 * GET /clients — staff Client list (maskedPassport only; no FR-6 plaintext).
 * Does not log response field values (PII).
 */
export const fetchClientsList = (): Promise<ClientListDto[]> =>
  apiRequest<ClientListDto[]>('/clients')
