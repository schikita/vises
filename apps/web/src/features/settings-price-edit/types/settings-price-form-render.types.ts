import type { FormEvent } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { SettingsPriceFormValues } from './settings-price-form.types'

export type SettingsPriceEditFormRenderProps = {
  apiError: string
  saved: boolean
  pending: boolean
  register: UseFormRegister<SettingsPriceFormValues>
  errors: FieldErrors<SettingsPriceFormValues>
  onSubmit: (e: FormEvent) => void
}
