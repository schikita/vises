import type { ShellKind, ShellNavItem } from './shell.types'

export type ShellLayoutProps = {
  kind: ShellKind
  items: ShellNavItem[]
  /** Null hides the role badge (DEC-P9 agents). */
  badgeLabel: string | null
  sessionName?: string
  sessionLogin?: string
  onLogout: () => void
}
