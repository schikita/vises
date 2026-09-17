import { extractApiErrorDetail } from './extract-api-error-detail.util'

/** Extract Nest `detail` string|array, else Russian fallback `Ошибка ${status}`. */
export const parseApiError = (data: unknown, status: number): string =>
  extractApiErrorDetail(data) ?? `Ошибка ${status}`
