import type { ShellNavItem } from './shell.types'

export type ShellNavListOrientation = 'horizontal' | 'vertical'

export type ShellNavListProps = {
  items: ShellNavItem[]
  orientation?: ShellNavListOrientation
  onNavigate?: () => void
}
