import type { ReactNode } from 'react'

export type FieldProps = {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}
