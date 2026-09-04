import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Status } from './types'
import { initials, statusLabel } from './types'

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 no-underline">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest text-[15px] font-extrabold text-[#e8f0ed]">
        V
      </span>
      <span className={`text-[17px] font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
        Vises
      </span>
    </Link>
  )
}

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    new: 'bg-[#e8eee9] text-forest',
    docs: 'bg-[#e7eef8] text-[#2b4f86]',
    review: 'bg-[#f4ead4] text-[#8a5a12]',
    ready: 'bg-[#e4f3ea] text-[#1f6b42]',
    booked: 'bg-[#dcefe8] text-leaf',
    done: 'bg-[#e7f6ed] text-[#146c3a]',
    fixes: 'bg-[#fbe7e0] text-clay',
  }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${map[status]}`}>
      {statusLabel(status)}
    </span>
  )
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl bg-forest text-white font-bold"
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {initials(name) || '—'}
    </div>
  )
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-line bg-card p-5 shadow-[0_1px_0_rgba(18,24,20,0.04)] ${className}`}>
      {children}
    </div>
  )
}

export function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="field-label">
        {label}
        {required ? <span className="text-clay"> *</span> : null}
      </span>
      {children}
    </label>
  )
}

export function Btn({
  children,
  onClick,
  to,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
}: {
  children: ReactNode
  onClick?: () => void
  to?: string
  variant?: 'primary' | 'ghost' | 'danger' | 'soft'
  type?: 'button' | 'submit'
  className?: string
  disabled?: boolean
}) {
  const styles = {
    primary: 'bg-forest text-white hover:bg-forest-2',
    ghost: 'bg-transparent text-ink border border-line hover:bg-white',
    danger: 'bg-[#f4e4de] text-clay hover:bg-[#edd6cd]',
    soft: 'bg-sand text-forest hover:bg-[#e0d1b8]',
  }[variant]
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${styles} ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {children}
    </button>
  )
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-base font-bold">{title}</p>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </div>
  )
}
