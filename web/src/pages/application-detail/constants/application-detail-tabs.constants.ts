import type { ApplicationDetailTabId } from '../types'

export const APPLICATION_DETAIL_TABS: Array<{
  id: ApplicationDetailTabId
  label: string
}> = [
  { id: 'trip', label: 'Поездка и статус' },
  { id: 'applicants', label: 'Заявители' },
  { id: 'payment', label: 'Оплата и документы' },
  { id: 'autofill', label: 'Автозаполнение' },
  { id: 'history', label: 'История' },
]

export const APPLICATION_DETAIL_DEFAULT_TAB: ApplicationDetailTabId = 'trip'
