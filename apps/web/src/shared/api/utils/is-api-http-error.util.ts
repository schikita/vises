import type { ApiHttpError } from '../types/api-http-error.types'

export const isApiHttpError = (value: unknown): value is ApiHttpError => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Partial<ApiHttpError>
  return (
    candidate.name === 'ApiHttpError' &&
    typeof candidate.status === 'number' &&
    typeof candidate.message === 'string'
  )
}
