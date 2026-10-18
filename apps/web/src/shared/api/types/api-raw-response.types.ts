export type ApiRawResponse<T = unknown> = {
  status: number
  data: T
  networkError: boolean
}
