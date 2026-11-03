import type { ShellNavItem } from './shell.types'

export type ShellTopBarProps = {
  items: ShellNavItem[]
  /** Null hides the role badge (DEC-P9 agents). */
  badgeLabel: string | null
  sessionName?: string
  sessionLogin?: string
  drawerOpen: boolean
  onToggleDrawer: () => void
  onLogout: () => void
}
