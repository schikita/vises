import type { Role } from '@/entities/user'

export const homePath = (role: Role) => {
  if (role === 'admin') return '/owner'
  if (role === 'manager') return '/admin'
  return '/app'
}
