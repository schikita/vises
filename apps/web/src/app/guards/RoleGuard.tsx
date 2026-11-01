import { Navigate } from 'react-router-dom'
import { homePath, isStaffRole, useSession } from '@/entities/session'
import type { RoleGuardProps } from './types'

/**
 * Fail-closed RoleGuard (FR-1 / AC-1): only `superadmin` | `admin` | `agent`.
 */
export const RoleGuard = ({ roles, children }: RoleGuardProps): React.ReactElement | null => {
  const { session, ready } = useSession()
  if (!ready) return null
  if (!session) return <Navigate to="/" replace />
  if (!isStaffRole(session.role)) return <Navigate to="/" replace />
  if (!roles.includes(session.role)) {
    return <Navigate to={homePath(session.role)} replace />
  }
  return <>{children}</>
}
