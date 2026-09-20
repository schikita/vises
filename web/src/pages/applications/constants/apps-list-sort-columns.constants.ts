import type { AppsListSortKey } from '../types'

export const APPS_LIST_SORT_COLUMNS: Array<{ key: AppsListSortKey; label: string }> = [
  { key: 'name', label: 'Заявка' },
  { key: 'category', label: 'Категория' },
  { key: 'city', label: 'Город' },
  { key: 'status', label: 'Статус' },
  { key: 'travelDate', label: 'Поездка' },
]
