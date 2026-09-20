import { WEBSHARE_PROXIES_NEVER_REFRESHED } from '../constants'

/** Format ISO refreshedAt for Settings UI; Russian fallback when null. */
export const formatWebshareRefreshedAt = (iso: string | null): string => {
  if (!iso) return WEBSHARE_PROXIES_NEVER_REFRESHED
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return WEBSHARE_PROXIES_NEVER_REFRESHED
  return date.toLocaleString('ru-RU')
}
