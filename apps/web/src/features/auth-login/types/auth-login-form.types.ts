export type AuthLoginFormValues = {
  identifier: string
  password: string
}

export type AuthLoginFormProps = {
  apiError: string
  onValidSubmit: (values: AuthLoginFormValues) => Promise<void>
}
