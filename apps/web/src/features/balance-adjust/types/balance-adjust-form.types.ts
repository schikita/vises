export type BalanceAdjustFormValues = {
  amount: string
  reason: string
}

export type BalanceAdjustFormProps = {
  apiError: string
  saved: boolean
  pending: boolean
  onValidSubmit: (values: BalanceAdjustFormValues) => Promise<boolean>
}
