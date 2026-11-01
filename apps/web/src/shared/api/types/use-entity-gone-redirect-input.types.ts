import type { QueryKey } from '@tanstack/react-query'

export type UseEntityGoneRedirectInput = {
  error: unknown
  enabled: boolean
  queryKey: QueryKey
  listPath: string
  noticeI18nKey: string
}
