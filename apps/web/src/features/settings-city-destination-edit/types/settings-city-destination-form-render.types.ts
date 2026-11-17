import type { FormEvent } from 'react'
import type { FieldErrors } from 'react-hook-form'
import type { SettingsCityDestinationFormValues } from './settings-city-destination-form.types'

export type SettingsCityDestinationFormRenderProps = {
  apiError: string
  saved: boolean
  pending: boolean
  cities: string[]
  destinations: string[]
  cityDraft: string
  destinationDraft: string
  errors: FieldErrors<SettingsCityDestinationFormValues>
  onCityDraftChange: (value: string) => void
  onDestinationDraftChange: (value: string) => void
  onAddCity: () => void
  onRemoveCity: (value: string) => void
  onAddDestination: () => void
  onRemoveDestination: (value: string) => void
  onSubmit: (e: FormEvent) => void
}
