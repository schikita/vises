import { apiRequest } from '@/shared/api'

/** DELETE /users/:userId. */
export const deleteUser = (userId: string): Promise<{ ok: true }> =>
  apiRequest<{ ok: true }>(`/users/${userId}`, {
    method: 'DELETE',
  })
