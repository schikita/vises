import type { ShellNavItem } from './shell.types'

export type ShellDrawerProps = {
  open: boolean
  items: ShellNavItem[]
  /** Null hides the role badge (DEC-P9 agents). */
  badgeLabel: string | null
  onClose: () => void
}
