export type ApiErrorDetailItem = {
  msg: string
}

export type ApiErrorBody = {
  detail?: string | ApiErrorDetailItem[]
}
