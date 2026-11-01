import type { ShellNavItem } from './shell.types'

export type ShellNavListProps = {
  items: ShellNavItem[]
  onNavigate?: () => void
}
