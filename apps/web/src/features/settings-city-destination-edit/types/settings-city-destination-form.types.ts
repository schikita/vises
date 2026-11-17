export type SettingsCityDestinationFormValues = {
  cities: string[]
  destinations: string[]
}

export type SettingsCityDestinationFormProps = {
  defaultValues: SettingsCityDestinationFormValues
  apiError: string
  saved: boolean
  pending: boolean
  onValidSubmit: (
    values: SettingsCityDestinationFormValues,
  ) => Promise<boolean>
}
