import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export const Btn = ({
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
}) => {
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
