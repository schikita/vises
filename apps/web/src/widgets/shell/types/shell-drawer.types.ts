import type { ShellNavItem } from './shell.types'

export type ShellDrawerProps = {
  open: boolean
  items: ShellNavItem[]
  badgeLabel: string
  onClose: () => void
}
