import type { StaffRole } from '@vises/contracts'

/** Create-admin UI affordance is superadmin-only (AC-6 / FR-4). */
export const canCreateAdmin = (actorRole: StaffRole): boolean =>
  actorRole === 'superadmin'
