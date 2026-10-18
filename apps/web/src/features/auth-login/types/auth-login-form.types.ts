export type AuthLoginFormValues = {
  login: string
  password: string
}

export type AuthLoginFormProps = {
  apiError: string
  onValidSubmit: (values: AuthLoginFormValues) => Promise<void>
}
