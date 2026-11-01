import type { LucideIcon } from 'lucide-react'

export type ShellKind = 'admin' | 'agent'

export type ShellNavItem = {
  to: string
  labelKey: string
  icon: LucideIcon
  end?: boolean
}
