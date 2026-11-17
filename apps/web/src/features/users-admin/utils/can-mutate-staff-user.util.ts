import type { Role } from '@/entities/user'

/**
 * Mirrors API `assertCanMutateUser` (FR-1.3–1.4):
 * superadmin may mutate any staff user; admin may mutate agents only.
 */
export const canMutateStaffUser = (params: {
  actorRole: Role | undefined
  targetRole: Role
  actorId?: string
  targetId?: string
}): boolean => {
  if (!params.actorRole) return false
  if (params.actorId && params.targetId && params.actorId === params.targetId) {
    return false
  }
  if (params.actorRole === 'superadmin') return true
  if (params.actorRole === 'admin' && params.targetRole === 'agent') return true
  return false
}
