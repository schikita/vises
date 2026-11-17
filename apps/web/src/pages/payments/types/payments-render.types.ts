import type { Application } from '@/entities/application'
import type { PaymentsListSortKey, PaymentsListSortState } from './payments-list.types'

export type PaymentsSortIconProps = {
  active: boolean
  dir: PaymentsListSortState['dir']
}

export type PaymentsRenderProps = {
  apps: Application[]
  total: number
  page: number
  pageSize: number
  paidLabel: string
  unpaidLabel: string
  loading: boolean
  error: string
  appsBase: string
  sort: PaymentsListSortState
  onSortChange: (key: PaymentsListSortKey) => void
  onPageChange: (page: number) => void
}
