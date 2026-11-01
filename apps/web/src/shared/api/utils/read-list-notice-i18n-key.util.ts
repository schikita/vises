import type { ListNoticeLocationState } from '../types/list-notice-location-state.types'

/** Read AC-19c flash notice key from react-router location.state. */
export const readListNoticeI18nKey = (state: unknown): string | null => {
  if (typeof state !== 'object' || state === null) {
    return null
  }
  const key = (state as ListNoticeLocationState).noticeI18nKey
  if (typeof key !== 'string' || key.trim() === '') {
    return null
  }
  return key
}
