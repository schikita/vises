import type { Session } from '../types'
import type { User } from '@/entities/user'

export const toSession = (user: User): Session => ({
  userId: user.id,
  role: user.role,
  name: user.name,
  email: user.email || user.login,
  login: user.login,
})
