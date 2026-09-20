export type SettingsEditFormValues = {
  company: string
  price: string
  destinations: string
  websharePlanId: string
}

export type SettingsEditFormProps = {
  defaultValues: SettingsEditFormValues
  lockedCitiesLabel: string
  saved: boolean
  onValidSubmit: (values: SettingsEditFormValues) => Promise<void>
}
