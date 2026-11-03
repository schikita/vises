import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Logo } from '@/shared/ui'
import { SHELL_DRAWER_PANEL_CLASS } from './constants'
import { ShellNavList } from './ShellNavList'
import type { ShellDrawerProps } from './types'

export const ShellDrawer = ({
  open,
  items,
  badgeLabel,
  onClose,
}: ShellDrawerProps): React.ReactElement | null => {
  const { t } = useTranslation()

  useEffect((): (() => void) | undefined => {
    if (!open) {
      return undefined
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return (): void => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-text-primary/40"
        aria-label={t('chrome.shell.closeMenu')}
        onClick={onClose}
      />
      <div className={SHELL_DRAWER_PANEL_CLASS} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            {badgeLabel ? (
              <span className="rounded-control bg-accent-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                {badgeLabel}
              </span>
            ) : null}
            <button
              type="button"
              className="rounded-control p-2 text-text-secondary hover:bg-background hover:text-text-primary"
              aria-label={t('chrome.shell.closeMenu')}
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto" aria-label={t('chrome.shell.navAriaLabel')}>
          <ShellNavList items={items} onNavigate={onClose} />
        </nav>
      </div>
    </div>
  )
}
