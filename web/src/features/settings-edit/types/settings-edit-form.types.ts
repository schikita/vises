export type SettingsEditFormValues = {
  company: string
  price: string
  cities: string
  destinations: string
  webshareProxyEnabled: boolean
  websharePlanId: string
}

export type SettingsEditFormProps = {
  defaultValues: SettingsEditFormValues
  saved: boolean
  onValidSubmit: (values: SettingsEditFormValues) => Promise<void>
}
