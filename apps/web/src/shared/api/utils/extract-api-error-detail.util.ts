import type { ApiErrorBody } from '../types'

/** Nest `detail` string|array only; undefined when absent. */
export const extractApiErrorDetail = (data: unknown): string | undefined => {
  const body = data as ApiErrorBody | null | undefined
  const detail = body && typeof body === 'object' ? body.detail : undefined
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(', ')
  return undefined
}
