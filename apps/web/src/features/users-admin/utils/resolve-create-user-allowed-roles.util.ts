import type { StaffRole } from '@vises/contracts'
import type { CreateUserFormRole } from '@/entities/user'
import { canCreateAdmin } from '@/entities/user'

/**
 * Roles offered in create-user UI. Never includes `superadmin`.
 * `admin` is offered only when the actor may create admins (AC-6).
 */
export const resolveCreateUserAllowedRoles = (
  actorRole: StaffRole,
): CreateUserFormRole[] => {
  if (canCreateAdmin(actorRole)) {
    return ['admin', 'agent']
  }
  return ['agent']
}
