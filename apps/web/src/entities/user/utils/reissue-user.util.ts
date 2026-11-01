import { apiRequest } from '@/shared/api'
import type { IssuedAccess } from '../types/issued-access.types'

/** POST /users/:userId/reissue. */
export const reissueUser = (userId: string): Promise<IssuedAccess> =>
  apiRequest<IssuedAccess>(`/users/${userId}/reissue`, {
    method: 'POST',
  })
