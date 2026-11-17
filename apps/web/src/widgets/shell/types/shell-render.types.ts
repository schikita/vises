import type { ShellKind, ShellNavItem } from './shell.types'

export type ShellRenderProps = {
  kind: ShellKind
  items: ShellNavItem[]
  logoTo: string | null
  sessionName?: string
  sessionLogin?: string
  onLogout: () => void
}
