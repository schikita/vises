import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, LogOut } from 'lucide-react'
import { Avatar } from '@/shared/ui'
import { SHELL_USER_MENU_PANEL_CLASS } from './constants'
import type { ShellUserMenuProps } from './types'

export const ShellUserMenu = ({
  sessionName,
  sessionLogin,
  onLogout,
}: ShellUserMenuProps): React.ReactElement => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const menuId = useId()

  useEffect((): (() => void) | undefined => {
    if (!open) {
      return undefined
    }
    const onPointerDown = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return (): void => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-control px-1.5 py-1 hover:bg-background"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t('chrome.shell.userMenuAriaLabel')}
        onClick={(): void => {
          setOpen((prev) => !prev)
        }}
      >
        <Avatar name={sessionName ?? ''} size={32} />
        <span className="hidden max-w-[9rem] truncate text-sm font-medium text-text-primary sm:inline">
          {sessionName}
        </span>
        <ChevronDown size={14} className="text-text-secondary" aria-hidden />
      </button>
      {open ? (
        <div id={menuId} role="menu" className={SHELL_USER_MENU_PANEL_CLASS}>
          <p className="truncate text-sm font-semibold text-text-primary">{sessionName}</p>
          <p className="truncate text-xs text-text-secondary">{sessionLogin}</p>
          <button
            type="button"
            role="menuitem"
            className="mt-3 flex w-full items-center gap-2 rounded-control px-2 py-2 text-sm font-medium text-danger hover:bg-background"
            onClick={(): void => {
              setOpen(false)
              onLogout()
            }}
          >
            <LogOut size={14} aria-hidden />
            {t('chrome.shell.logout')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
