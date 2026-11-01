import { useNavigate } from 'react-router-dom'
import { useSession } from '@/entities/session'
import { ADMIN_NAV, AGENT_NAV } from './constants'
import { ShellLayout } from './ShellLayout'
import type { ShellProps } from './types'

export const Shell = ({ kind }: ShellProps): React.ReactElement => {
  const { session, logout } = useSession()
  const nav = useNavigate()
  const items = kind === 'admin' ? ADMIN_NAV : AGENT_NAV

  const onLogout = (): void => {
    logout()
    nav('/')
  }

  return (
    <ShellLayout
      kind={kind}
      items={items}
      sessionName={session?.name}
      sessionLogin={session?.login}
      onLogout={onLogout}
    />
  )
}
