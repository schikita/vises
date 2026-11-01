import { Link } from 'react-router-dom'
import { BTN_BASE_CLASS, BTN_VARIANT_CLASS } from './btn.constants'
import type { BtnProps } from './btn.types'

export const Btn = (props: BtnProps): React.ReactElement => {
  const {
    children,
    onClick,
    to,
    variant = 'primary',
    type = 'button',
    className = '',
    disabled = false,
  } = props
  const cls = `${BTN_BASE_CLASS} ${BTN_VARIANT_CLASS[variant]} ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`.trim()

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
