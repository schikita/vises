import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SHELL_MAIN_CLASS, SHELL_MAIN_INNER_CLASS } from './constants'
import { ShellDrawer } from './ShellDrawer'
import { ShellTopBar } from './ShellTopBar'
import type { ShellLayoutProps } from './types'

export const ShellLayout = ({
  items,
  badgeLabel,
  sessionName,
  sessionLogin,
  onLogout,
}: ShellLayoutProps): React.ReactElement => {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerPath, setDrawerPath] = useState(location.pathname)

  if (drawerPath !== location.pathname) {
    setDrawerPath(location.pathname)
    if (drawerOpen) {
      setDrawerOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <ShellTopBar
        items={items}
        badgeLabel={badgeLabel}
        sessionName={sessionName}
        sessionLogin={sessionLogin}
        drawerOpen={drawerOpen}
        onToggleDrawer={(): void => {
          setDrawerOpen((prev) => !prev)
        }}
        onLogout={onLogout}
      />
      <ShellDrawer
        open={drawerOpen}
        items={items}
        badgeLabel={badgeLabel}
        onClose={(): void => {
          setDrawerOpen(false)
        }}
      />
      <main className={SHELL_MAIN_CLASS}>
        <div className={SHELL_MAIN_INNER_CLASS}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
