import { apiRequest } from '@/shared/api'
import type { ClientDetailWithPortalForm } from '../types/client-detail-with-portal-form.types'

/**
 * GET /clients/:clientId → FR-6 plaintext + portal-form detail fields
 * (`ClientDetailDto` ∩ `ClientPortalFormDetailDto`).
 */
export const fetchClientDetail = (
  clientId: string,
): Promise<ClientDetailWithPortalForm> =>
  apiRequest<ClientDetailWithPortalForm>(
    `/clients/${encodeURIComponent(clientId)}`,
  )
