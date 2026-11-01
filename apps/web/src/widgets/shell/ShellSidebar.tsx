import { useTranslation } from 'react-i18next'
import { Logo } from '@/shared/ui'
import { SHELL_SIDEBAR_CLASS } from './constants'
import { ShellNavList } from './ShellNavList'
import type { ShellSidebarProps } from './types'

export const ShellSidebar = ({
  items,
  badgeLabel,
}: ShellSidebarProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <aside className={SHELL_SIDEBAR_CLASS}>
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
        <Logo />
        <span className="rounded-control bg-accent-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
          {badgeLabel}
        </span>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto" aria-label={t('chrome.shell.navAriaLabel')}>
        <ShellNavList items={items} />
      </nav>
    </aside>
  )
}
