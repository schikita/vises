export type AuthRegisterFormValues = {
  name: string
  login: string
  password: string
  email: string
}

export type AuthRegisterFormProps = {
  apiError: string
  onValidSubmit: (values: AuthRegisterFormValues) => Promise<void>
}
