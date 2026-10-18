import type { Role } from '@/entities/user'

export const staffBase = (role?: Role | null) => (role === 'admin' ? '/owner' : '/admin')
