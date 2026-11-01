import type { ApplicationDetailTabId } from '../types'

/** Tab ids only — labels come from i18n (AC-20a). */
export const APPLICATION_DETAIL_TAB_IDS: ApplicationDetailTabId[] = [
  'trip',
  'applicants',
  'payment',
  'history',
]

export const APPLICATION_DETAIL_DEFAULT_TAB: ApplicationDetailTabId = 'trip'
