export type BalanceTopUpFormValues = {
  amount: string
}

export type BalanceTopUpFormProps = {
  apiError: string
  saved: boolean
  pending: boolean
  onValidSubmit: (values: BalanceTopUpFormValues) => Promise<boolean>
}
