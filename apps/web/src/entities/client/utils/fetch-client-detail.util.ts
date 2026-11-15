import { apiRequest } from '@/shared/api'
import type { ClientDetailWithPortalForm } from '../types'

/**
 * GET /clients/:clientId — FR-6 plaintext + portal-form (incl. journey/contact).
 * Does not log response field values (PII).
 */
export const fetchClientDetail = (
  clientId: string,
): Promise<ClientDetailWithPortalForm> =>
  apiRequest<ClientDetailWithPortalForm>(
    `/clients/${encodeURIComponent(clientId)}`,
  )
