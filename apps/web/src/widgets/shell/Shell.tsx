import { useNavigate } from 'react-router-dom'
import { useStore } from '@/app/providers'
import { CLIENT_NAV, OFFICE_NAV, OWNER_NAV } from './constants'
import { ShellRender } from './ShellRender'
import type { ShellKind } from './types'

type ShellProps = {
  kind: ShellKind
}

export const Shell = ({ kind }: ShellProps) => {
  const { session, logout } = useStore()
  const nav = useNavigate()
  const items = kind === 'owner' ? OWNER_NAV : kind === 'office' ? OFFICE_NAV : CLIENT_NAV

  const onLogout = () => {
    logout()
    nav('/')
  }

  return (
    <ShellRender
      kind={kind}
      items={items}
      sessionName={session?.name}
      sessionLogin={session?.login}
      onLogout={onLogout}
    />
  )
}
