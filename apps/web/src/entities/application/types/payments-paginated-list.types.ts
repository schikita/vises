import type { Application } from './application.types'
import type { PaginatedList } from '@/shared/api'

export type PaymentsSummary = {
  paidTotal: number
  unpaidTotal: number
}

/** Paged payments list + full-set summary. */
export type PaymentsPaginatedList = PaginatedList<Application> & {
  summary: PaymentsSummary
}
