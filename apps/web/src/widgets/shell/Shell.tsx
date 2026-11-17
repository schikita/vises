import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/app/providers'
import { homePath } from '@/entities/session'
import { OFFICE_NAV, OWNER_NAV } from './constants'
import { ShellRender } from './ShellRender'
import type { ShellProps } from './types'

export const Shell = ({ kind }: ShellProps): ReactElement => {
  const { session, logout } = useStore()
  const nav = useNavigate()
  const items = kind === 'owner' ? OWNER_NAV : OFFICE_NAV
  const logoTo = session ? homePath(session.role) : null

  const onLogout = (): void => {
    logout()
    nav('/')
  }

  return (
    <ShellRender
      kind={kind}
      items={items}
      logoTo={logoTo}
      sessionName={session?.name}
      sessionLogin={session?.login}
      onLogout={onLogout}
    />
  )
}
