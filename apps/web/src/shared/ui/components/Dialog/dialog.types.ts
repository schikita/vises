import type { ReactNode } from 'react'

export type DialogProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  closeAriaLabel?: string
}
