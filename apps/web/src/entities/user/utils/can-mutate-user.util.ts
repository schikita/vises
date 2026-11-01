import type { StaffRole } from '@vises/contracts'

/**
 * Mirrors backend `assertCanMutateUser` (FR-4): superadmin may mutate any staff;
 * admin may mutate agents only.
 */
export const canMutateUser = (params: {
  actorRole: StaffRole
  targetRole: StaffRole
}): boolean => {
  if (params.actorRole === 'superadmin') {
    return true
  }
  return params.actorRole === 'admin' && params.targetRole === 'agent'
}
