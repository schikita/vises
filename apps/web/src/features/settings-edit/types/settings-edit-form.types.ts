export type SettingsEditFormValues = {
  company: string
  price: string
  cities: string[]
  destinations: string[]
}

export type SettingsEditFormProps = {
  defaultValues: SettingsEditFormValues
  saved: boolean
  onValidSubmit: (values: SettingsEditFormValues) => Promise<void>
}
