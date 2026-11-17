import type { FormEvent } from 'react'
import type { FieldErrors, UseFormRegisterReturn } from 'react-hook-form'
import type { SettingsEditFormValues } from './settings-edit-form.types'

export type SettingsEditFormRenderProps = {
  saved: boolean
  saving: boolean
  companyRegister: UseFormRegisterReturn
  priceRegister: UseFormRegisterReturn
  cities: string[]
  destinations: string[]
  cityDraft: string
  destinationDraft: string
  errors: FieldErrors<SettingsEditFormValues>
  onCityDraftChange: (value: string) => void
  onDestinationDraftChange: (value: string) => void
  onAddCity: () => void
  onRemoveCity: (value: string) => void
  onAddDestination: () => void
  onRemoveDestination: (value: string) => void
  onSubmit: (e: FormEvent) => void
}
