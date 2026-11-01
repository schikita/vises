import type { FormEvent } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { BalanceTopUpFormValues } from './balance-top-up-form.types'

export type BalanceTopUpFormRenderProps = {
  apiError: string
  saved: boolean
  pending: boolean
  register: UseFormRegister<BalanceTopUpFormValues>
  errors: FieldErrors<BalanceTopUpFormValues>
  onSubmit: (event: FormEvent) => void
}
