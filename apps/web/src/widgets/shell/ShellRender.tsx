import type { ReactElement } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Logo } from '@/shared/ui'
import { SHELL_BADGE } from './constants'
import type { ShellRenderProps } from './types'

export const ShellRender = ({
  kind,
  items,
  logoTo,
  sessionName,
  sessionLogin,
  onLogout,
}: ShellRenderProps): ReactElement => (
  <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
    <aside className="flex flex-col bg-forest text-[#d7e6e0] lg:sticky lg:top-0 lg:h-screen lg:self-start">
      <div className="flex shrink-0 items-center justify-between px-5 py-5">
        <Logo light to={logoTo} />
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sand">
          {SHELL_BADGE[kind]}
        </span>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto">
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
      <div className="mt-auto hidden shrink-0 border-t border-white/10 px-5 py-4 lg:block">
        <p className="text-sm font-bold text-white">{sessionName}</p>
        <p className="text-xs text-[#9fb6ae]">{sessionLogin}</p>
        <button
          className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#f0c0ae] hover:text-white"
          onClick={onLogout}
        >
          <LogOut size={14} />
          Выйти
        </button>
      </div>
    </aside>
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-line bg-card px-4 py-3 lg:hidden">
        <p className="text-sm font-bold">{sessionName}</p>
        <button className="text-sm font-semibold text-clay" onClick={onLogout}>
          Выйти
        </button>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  </div>
)
