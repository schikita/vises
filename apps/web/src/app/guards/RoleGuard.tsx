import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useStore } from '@/app/providers'
import { homePath } from '@/entities/session'
import type { Role } from '@/entities/user'

type RoleGuardProps = {
  roles: Role[]
  children: ReactNode
}

export const RoleGuard = ({ roles, children }: RoleGuardProps) => {
  const { session, ready } = useStore()
  if (!ready) return null
  if (!session) return <Navigate to="/" replace />
  if (!roles.includes(session.role)) return <Navigate to={homePath(session.role)} replace />
  return children
}
