import type { VisitsListSortKey } from '../types'

export const VISITS_LIST_SORT_COLUMNS: Array<{ key: VisitsListSortKey; label: string }> = [
  { key: 'applicant', label: 'Заявитель' },
  { key: 'city', label: 'Город' },
  { key: 'date', label: 'Дата' },
  { key: 'time', label: 'Время' },
  { key: 'place', label: 'Куда' },
  { key: 'created', label: 'Создана' },
]
