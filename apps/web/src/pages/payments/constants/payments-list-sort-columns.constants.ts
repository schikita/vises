import type { PaymentsListSortKey } from '../types'

export const PAYMENTS_LIST_SORT_COLUMNS: Array<{
  key: PaymentsListSortKey
  label: string
  thClassName: string
}> = [
  { key: 'app', label: 'Заявка', thClassName: 'w-[28%]' },
  { key: 'amount', label: 'Сумма', thClassName: 'w-[14%]' },
  { key: 'status', label: 'Статус', thClassName: 'w-[16%]' },
  { key: 'note', label: 'Заметка', thClassName: 'w-[24%]' },
  { key: 'created', label: 'Создана', thClassName: 'w-[18%]' },
]
