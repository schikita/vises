import type { ReactNode } from 'react'

export type ClientCreateFormValues = {
  email: string
  phone: string
  address: string
  purpose: string
}

export type ClientCreateFormProps = {
  apiError: string
  pending: boolean
  priceHint: ReactNode
  onValidSubmit: (values: ClientCreateFormValues) => Promise<boolean>
}
