import {
  CalendarDays,
  CreditCard,
  FileText,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
} from 'lucide-react'
import type { ShellKind, ShellNavItem } from '../types'

export const OWNER_NAV: ShellNavItem[] = [
  { to: '/owner', label: 'Система', icon: LayoutDashboard, end: true },
  { to: '/owner/users', label: 'Пользователи', icon: Users },
  { to: '/owner/apps', label: 'Заявки', icon: FileText },
  { to: '/owner/visits', label: 'Визиты', icon: CalendarDays },
  { to: '/owner/payments', label: 'Платежи', icon: CreditCard },
  { to: '/owner/settings', label: 'Настройки', icon: Settings },
]

export const OFFICE_NAV: ShellNavItem[] = [
  { to: '/admin', label: 'Дашборд', icon: LayoutDashboard, end: true },
  { to: '/admin/apps', label: 'Заявки', icon: FileText },
  { to: '/admin/visits', label: 'Визиты', icon: CalendarDays },
  { to: '/admin/payments', label: 'Платежи', icon: CreditCard },
  { to: '/admin/settings', label: 'Настройки', icon: Settings },
]

export const CLIENT_NAV: ShellNavItem[] = [
  { to: '/app', label: 'Мои заявки', icon: FileText, end: true },
  { to: '/app/new', label: 'Новая заявка', icon: Plus },
]

export const SHELL_BADGE: Record<ShellKind, string> = {
  owner: 'Админ',
  office: 'Агент',
  client: 'Кабинет',
}
