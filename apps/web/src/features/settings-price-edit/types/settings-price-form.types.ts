export type SettingsPriceFormValues = {
  price_per_client: string
}

export type SettingsPriceEditFormProps = {
  defaultValues: SettingsPriceFormValues
  apiError: string
  saved: boolean
  pending: boolean
  onValidSubmit: (values: SettingsPriceFormValues) => Promise<boolean>
}
