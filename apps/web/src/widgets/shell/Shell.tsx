import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSession } from '@/entities/session'
import { ADMIN_NAV, AGENT_NAV } from './constants'
import { ShellLayout } from './ShellLayout'
import type { ShellProps } from './types'
import { resolveShellBadgeLabelKey } from './utils'

export const Shell = ({ kind }: ShellProps): React.ReactElement => {
  const { session, logout } = useSession()
  const { t } = useTranslation()
  const nav = useNavigate()
  const items = kind === 'admin' ? ADMIN_NAV : AGENT_NAV
  const badgeKey = resolveShellBadgeLabelKey(session?.role)
  const badgeLabel = badgeKey ? t(badgeKey) : null

  const onLogout = (): void => {
    logout()
    nav('/')
  }

  return (
    <ShellLayout
      kind={kind}
      items={items}
      badgeLabel={badgeLabel}
      sessionName={session?.name}
      sessionLogin={session?.login}
      onLogout={onLogout}
    />
  )
}
