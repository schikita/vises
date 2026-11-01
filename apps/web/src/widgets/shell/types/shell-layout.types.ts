import type { ShellKind, ShellNavItem } from './shell.types'

export type ShellLayoutProps = {
  kind: ShellKind
  items: ShellNavItem[]
  sessionName?: string
  sessionLogin?: string
  onLogout: () => void
}
