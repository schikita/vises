import type { Role } from '@/entities/user'

export const homePath = (role: Role): string => {
  if (role === 'admin' || role === 'superadmin') return '/admin'
  return '/app'
}
