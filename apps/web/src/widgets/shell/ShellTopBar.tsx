import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import { LanguageControl } from '@/features/language-switch'
import { Logo, ThemeControl } from '@/shared/ui'
import { SHELL_TOP_BAR_CLASS } from './constants'
import { ShellUserMenu } from './ShellUserMenu'
import type { ShellTopBarProps } from './types'

export const ShellTopBar = ({
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
      <div className="md:hidden">
        <Logo />
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeControl />
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
