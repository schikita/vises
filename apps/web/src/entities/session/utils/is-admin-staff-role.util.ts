import type { Role } from '@/entities/user'

/** True for admin|superadmin staff tiers (DEC-ASAU-006). */
export const isAdminStaffRole = (role?: Role | null): boolean =>
  role === 'admin' || role === 'superadmin'
