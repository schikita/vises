import type { FormEvent } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { BalanceAdjustFormValues } from './balance-adjust-form.types'

export type BalanceAdjustFormRenderProps = {
  apiError: string
  saved: boolean
  pending: boolean
  register: UseFormRegister<BalanceAdjustFormValues>
  errors: FieldErrors<BalanceAdjustFormValues>
  onSubmit: (event: FormEvent) => void
}
