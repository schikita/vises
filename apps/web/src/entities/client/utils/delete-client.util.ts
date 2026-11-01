import { apiRequest } from '@/shared/api'

/** DELETE /clients/:clientId — staff-only; no refund. */
export const deleteClient = (clientId: string): Promise<{ ok: true }> =>
  apiRequest<{ ok: true }>(`/clients/${encodeURIComponent(clientId)}`, {
    method: 'DELETE',
  })
