import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SHELL_BADGE_KEY } from './constants'
import { ShellDrawer } from './ShellDrawer'
import { ShellSidebar } from './ShellSidebar'
import { ShellTopBar } from './ShellTopBar'
import type { ShellLayoutProps } from './types'

export const ShellLayout = ({
  kind,
  items,
  sessionName,
  sessionLogin,
  onLogout,
}: ShellLayoutProps): React.ReactElement => {
  const { t } = useTranslation()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerPath, setDrawerPath] = useState(location.pathname)
  const badgeLabel = t(SHELL_BADGE_KEY[kind])

  if (drawerPath !== location.pathname) {
    setDrawerPath(location.pathname)
    if (drawerOpen) {
      setDrawerOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <ShellTopBar
        sessionName={sessionName}
        sessionLogin={sessionLogin}
        drawerOpen={drawerOpen}
        onToggleDrawer={(): void => {
          setDrawerOpen((prev) => !prev)
        }}
        onLogout={onLogout}
      />
      <div className="md:flex">
        <ShellSidebar items={items} badgeLabel={badgeLabel} />
        <ShellDrawer
          open={drawerOpen}
          items={items}
          badgeLabel={badgeLabel}
          onClose={(): void => {
            setDrawerOpen(false)
          }}
        />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
