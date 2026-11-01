import type { FormEvent, ReactNode } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { ClientCreateFormValues } from './client-create-form.types'

export type ClientCreateFormRenderProps = {
  apiError: string
  pending: boolean
  priceHint: ReactNode
  register: UseFormRegister<ClientCreateFormValues>
  errors: FieldErrors<ClientCreateFormValues>
  onSubmit: (event: FormEvent) => void
}
