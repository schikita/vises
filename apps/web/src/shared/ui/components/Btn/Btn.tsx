import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Btn = ({
  children,
  onClick,
  to,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
  loading = false,
}: {
  children: ReactNode
  onClick?: () => void
  to?: string
  variant?: 'primary' | 'ghost' | 'danger' | 'soft'
  type?: 'button' | 'submit'
  className?: string
  disabled?: boolean
  loading?: boolean
}) => {
  const styles = {
    primary: 'bg-forest text-white hover:bg-forest-2',
    ghost: 'bg-transparent text-ink border border-line hover:bg-white',
    danger: 'bg-[#f4e4de] text-clay hover:bg-[#edd6cd]',
    soft: 'bg-sand text-forest hover:bg-[#e0d1b8]',
  }[variant]
  const isDisabled = disabled || loading
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${styles} ${className} ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`
  const content = (
    <>
      {loading ? (
        <Loader2 size={16} className="shrink-0 animate-spin" aria-hidden />
      ) : null}
      {children}
    </>
  )
  if (to) {
    return (
      <Link to={to} className={cls} aria-disabled={isDisabled || undefined}>
        {content}
      </Link>
    )
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={cls}
      disabled={isDisabled}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  )
}
