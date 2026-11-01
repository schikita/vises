import { apiRequest } from '@/shared/api'
import type { PatchUserInput } from '../types/patch-user-input.types'
import type { User } from '../types/user.types'

/** PATCH /users/:userId. */
export const patchUser = (userId: string, patch: PatchUserInput): Promise<User> =>
  apiRequest<User>(`/users/${userId}`, {
    method: 'PATCH',
    data: patch,
  })
