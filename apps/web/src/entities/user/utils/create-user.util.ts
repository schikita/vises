import { apiRequest } from '@/shared/api'
import type { CreateUserInput } from '../types/create-user-input.types'
import type { IssuedAccess } from '../types/issued-access.types'

/** POST /users — staff create (create-admin is superadmin-only on the server). */
export const createUser = (input: CreateUserInput): Promise<IssuedAccess> =>
  apiRequest<IssuedAccess>('/users', {
    method: 'POST',
    data: input,
  })
