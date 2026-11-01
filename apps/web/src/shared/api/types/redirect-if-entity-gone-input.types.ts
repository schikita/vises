import type { QueryClient, QueryKey } from '@tanstack/react-query'
import type { NavigateFunction } from 'react-router-dom'

export type RedirectIfEntityGoneInput = {
  error: unknown
  queryClient: QueryClient
  queryKey: QueryKey
  navigate: NavigateFunction
  listPath: string
  noticeI18nKey: string
}
