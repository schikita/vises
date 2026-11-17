import {
  CalendarDays,
  ChartColumn,
  CreditCard,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react'
import type { ShellKind, ShellNavItem } from '../types'

/** Admin / superadmin shell under `/admin` (FR-10 / ASAU-011). */
export const OWNER_NAV: ShellNavItem[] = [
  { to: '/admin', label: 'Система', icon: LayoutDashboard, end: true },
  { to: '/admin/analytics', label: 'Аналитика', icon: ChartColumn },
  { to: '/admin/users', label: 'Пользователи', icon: Users },
  { to: '/admin/apps', label: 'Заявки', icon: FileText },
  { to: '/admin/visits', label: 'Визиты', icon: CalendarDays },
  { to: '/admin/payments', label: 'Платежи', icon: CreditCard },
  { to: '/admin/settings', label: 'Настройки', icon: Settings },
]

/** Agent shell under `/app`. */
export const OFFICE_NAV: ShellNavItem[] = [
  { to: '/app', label: 'Дашборд', icon: LayoutDashboard, end: true },
  { to: '/app/apps', label: 'Заявки', icon: FileText },
  { to: '/app/visits', label: 'Визиты', icon: CalendarDays },
  { to: '/app/payments', label: 'Платежи', icon: CreditCard },
  { to: '/app/settings', label: 'Настройки', icon: Settings },
]

export const SHELL_BADGE: Record<ShellKind, string> = {
  owner: 'Админ',
  office: 'Агент',
}
