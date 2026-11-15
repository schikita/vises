import type { ReactNode } from 'react'

export type PortalThemedFieldProps = {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
  hint?: string
}
