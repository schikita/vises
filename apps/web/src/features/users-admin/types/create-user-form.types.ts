export type CreateUserFormValues = {
  name: string
  email: string
  login: string
  role: 'client' | 'manager' | 'admin'
}

export type CreateUserFormProps = {
  apiError: string
  onValidSubmit: (values: CreateUserFormValues) => Promise<boolean>
}
