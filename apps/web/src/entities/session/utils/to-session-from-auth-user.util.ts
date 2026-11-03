import type { AuthSessionUserDto } from '@/shared/api'
import type { Session } from '../types'
import { isStaffRole } from './is-staff-role.util'

/**
 * Map login/register/demo user payload into session.
 * Returns `null` when role is not in the three-role StaffRole union (fail-closed).
 */
export const toSessionFromAuthUser = (user: AuthSessionUserDto): Session | null => {
  if (!isStaffRole(user.role)) return null
  return {
    userId: user.id,
    role: user.role,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email || user.login,
    login: user.login,
    active: user.active,
    balance: null,
  }
}
