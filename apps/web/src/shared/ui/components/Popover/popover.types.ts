import type { ReactElement, ReactNode } from 'react'

export type PopoverProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactElement
  children: ReactNode
  contentClassName?: string
  contentId?: string
  contentAriaLabel?: string
}
