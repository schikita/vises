export type AuthRegisterFormValues = {
  firstName: string
  lastName: string
  login: string
  email: string
  password: string
}

export type AuthRegisterFormProps = {
  apiError: string
  onValidSubmit: (values: AuthRegisterFormValues) => Promise<void>
}
