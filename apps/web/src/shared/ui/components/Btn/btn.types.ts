import type { ReactNode } from 'react'

export type BtnVariant = 'primary' | 'ghost' | 'danger' | 'soft'

export type BtnProps = {
  children: ReactNode
  onClick?: () => void
  to?: string
  variant?: BtnVariant
  type?: 'button' | 'submit'
  className?: string
  disabled?: boolean
}
