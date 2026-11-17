import type { Role } from '@/entities/user'

/** Path prefix for staff list/detail links (`/app` agent, `/admin` admin tiers). */
export const staffBase = (role?: Role | null): string =>
  role === 'admin' || role === 'superadmin' ? '/admin' : '/app'
