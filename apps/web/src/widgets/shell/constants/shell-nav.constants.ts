import {
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  UserRound,
  Wallet,
} from 'lucide-react'
import type { ShellKind, ShellNavItem } from '../types'

/** Admin / superadmin sidebar (FR-2 / AC-4): no payments, Proxy6, visits, or BLS. */
export const ADMIN_NAV: ShellNavItem[] = [
  { to: '/admin', labelKey: 'chrome.shell.nav.analytics', icon: LayoutDashboard, end: true },
  { to: '/admin/users', labelKey: 'chrome.shell.nav.users', icon: Users },
  { to: '/admin/agents', labelKey: 'chrome.shell.nav.agents', icon: Wallet },
  { to: '/admin/clients', labelKey: 'chrome.shell.nav.clients', icon: UserRound },
  { to: '/admin/apps', labelKey: 'chrome.shell.nav.applications', icon: FileText },
  { to: '/admin/settings', labelKey: 'chrome.shell.nav.settings', icon: Settings },
]

/** Agent sidebar (FR-2 / AC-4): no settings, users admin, or legacy surfaces. */
export const AGENT_NAV: ShellNavItem[] = [
  {
    to: '/app',
    labelKey: 'chrome.shell.nav.analytics',
    icon: LayoutDashboard,
    end: true,
  },
  { to: '/app/clients', labelKey: 'chrome.shell.nav.clients', icon: UserRound },
  { to: '/app/apps', labelKey: 'chrome.shell.nav.applications', icon: FileText },
  { to: '/app/balance', labelKey: 'chrome.shell.nav.balance', icon: Wallet },
]

export const SHELL_BADGE_KEY: Record<ShellKind, string> = {
  admin: 'chrome.shell.badge.admin',
  agent: 'chrome.shell.badge.agent',
}

/** Exact URL path segments banned from shell nav (AC-4 / FE5 board). */
export const SHELL_NAV_FORBIDDEN_SEGMENTS = [
  'payments',
  'proxy6',
  'visits',
  'bls',
  'owner',
  'client',
] as const
