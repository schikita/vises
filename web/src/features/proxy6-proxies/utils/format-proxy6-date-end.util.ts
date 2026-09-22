import { PROXY6_EXPIRY_UNKNOWN } from '../constants'

/** Format ISO dateEnd for inventory rows; safe fallback when invalid. */
export const formatProxy6DateEnd = (iso: string | null | undefined): string => {
  if (!iso) return PROXY6_EXPIRY_UNKNOWN
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return PROXY6_EXPIRY_UNKNOWN
  return date.toLocaleString('ru-RU')
}
