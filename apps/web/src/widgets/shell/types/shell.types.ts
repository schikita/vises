import type { LucideIcon } from 'lucide-react'

export type ShellKind = 'owner' | 'office'

export type ShellNavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}
