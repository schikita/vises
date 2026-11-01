import type { ApiHttpError } from '../types/api-http-error.types'

/** Build an `ApiHttpError` with HTTP status + optional Nest body/detail message. */
export const createApiHttpError = (
  status: number,
  message: string,
  body: unknown = undefined,
): ApiHttpError => {
  const error = new Error(message) as ApiHttpError
  Object.defineProperty(error, 'name', { value: 'ApiHttpError' })
  Object.defineProperty(error, 'status', { value: status })
  Object.defineProperty(error, 'body', { value: body })
  return error
}
