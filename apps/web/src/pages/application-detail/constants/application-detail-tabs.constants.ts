import type { ApplicationDetailTabId } from '../types'

export const APPLICATION_DETAIL_TABS: Array<{
  id: ApplicationDetailTabId
  label: string
}> = [
  { id: 'applicants', label: 'Анкета портала' },
  { id: 'trip', label: 'Поездка и статус' },
  { id: 'payment', label: 'Оплата и документы' },
  { id: 'history', label: 'История' },
]

/** Primary portal data entry (PF-TASK-006) — one-page form, not multi-tab anketa. */
export const APPLICATION_DETAIL_DEFAULT_TAB: ApplicationDetailTabId = 'applicants'
