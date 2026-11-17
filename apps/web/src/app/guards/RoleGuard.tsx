import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useStore } from '@/app/providers'
import { homePath } from '@/entities/session'
import type { RoleGuardProps } from './role-guard.types'

export const RoleGuard = ({ roles, children }: RoleGuardProps): ReactElement | null => {
  const { session, ready } = useStore()
  if (!ready) return null
  if (!session) return <Navigate to="/" replace />
  if (!roles.includes(session.role)) return <Navigate to={homePath(session.role)} replace />
  return <>{children}</>
}
