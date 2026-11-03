import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import { LanguageControl } from '@/features/language-switch'
import { Logo } from '@/shared/ui'
import { SHELL_TOP_BAR_CLASS, SHELL_TOP_NAV_CLASS } from './constants'
import { ShellNavList } from './ShellNavList'
import { ShellUserMenu } from './ShellUserMenu'
import type { ShellTopBarProps } from './types'

export const ShellTopBar = ({
  items,
  badgeLabel,
  sessionName,
  sessionLogin,
  drawerOpen,
  onToggleDrawer,
  onLogout,
}: ShellTopBarProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <header className={SHELL_TOP_BAR_CLASS}>
      <button
        type="button"
        className="rounded-control p-2 text-text-secondary hover:bg-background hover:text-text-primary md:hidden"
        aria-label={drawerOpen ? t('chrome.shell.closeMenu') : t('chrome.shell.openMenu')}
        aria-expanded={drawerOpen}
        onClick={onToggleDrawer}
      >
        <Menu size={20} />
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <Logo />
        {badgeLabel ? (
          <span className="hidden rounded-control bg-accent-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent sm:inline">
            {badgeLabel}
          </span>
        ) : null}
      </div>

      <nav className={SHELL_TOP_NAV_CLASS} aria-label={t('chrome.shell.navAriaLabel')}>
        <ShellNavList items={items} orientation="horizontal" />
      </nav>

      <div className="ml-auto flex items-center gap-2 sm:gap-3 md:ml-0">
        <LanguageControl />
        <ShellUserMenu
          sessionName={sessionName}
          sessionLogin={sessionLogin}
          onLogout={onLogout}
        />
      </div>
    </header>
  )
}
