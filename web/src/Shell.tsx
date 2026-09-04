import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Users,
} from 'lucide-react'
import { useStore } from './store'
import { Logo } from './ui'

const ownerNav = [
  { to: '/owner', label: 'Система', icon: LayoutDashboard, end: true },
  { to: '/owner/users', label: 'Пользователи', icon: Users },
  { to: '/owner/apps', label: 'Заявки', icon: FileText },
  { to: '/owner/visits', label: 'Визиты', icon: CalendarDays },
  { to: '/owner/payments', label: 'Платежи', icon: CreditCard },
  { to: '/owner/settings', label: 'Настройки', icon: Settings },
]

const officeNav = [
  { to: '/admin', label: 'Дашборд', icon: LayoutDashboard, end: true },
  { to: '/admin/apps', label: 'Заявки', icon: FileText },
  { to: '/admin/visits', label: 'Визиты', icon: CalendarDays },
  { to: '/admin/payments', label: 'Платежи', icon: CreditCard },
  { to: '/admin/settings', label: 'Настройки', icon: Settings },
]

const clientNav = [
  { to: '/app', label: 'Мои заявки', icon: FileText, end: true },
  { to: '/app/new', label: 'Новая заявка', icon: Plus },
]

const badge = {
  owner: 'Админ',
  office: 'Агент',
  client: 'Кабинет',
}

export function Shell({ kind }: { kind: 'owner' | 'office' | 'client' }) {
  const { session, logout } = useStore()
  const nav = useNavigate()
  const items = kind === 'owner' ? ownerNav : kind === 'office' ? officeNav : clientNav

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col bg-forest text-[#d7e6e0]">
        <div className="flex items-center justify-between px-5 py-5">
          <Logo light />
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sand">
            {badge[kind]}
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-white/12 text-white' : 'text-[#c5d7d0] hover:bg-white/6 hover:text-white'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-white/10 px-5 py-4 lg:block">
          <p className="text-sm font-bold text-white">{session?.name}</p>
          <p className="text-xs text-[#9fb6ae]">{session?.login}</p>
          <button
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#f0c0ae] hover:text-white"
            onClick={() => {
              logout()
              nav('/')
            }}
          >
            <LogOut size={14} />
            Выйти
          </button>
        </div>
      </aside>
      <div className="min-h-screen">
        <header className="flex items-center justify-between border-b border-line bg-card px-4 py-3 lg:hidden">
          <p className="text-sm font-bold">{session?.name}</p>
          <button
            className="text-sm font-semibold text-clay"
            onClick={() => {
              logout()
              nav('/')
            }}
          >
            Выйти
          </button>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
