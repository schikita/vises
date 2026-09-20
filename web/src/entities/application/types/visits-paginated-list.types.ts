import type { Application } from './application.types'
import type { PaginatedList } from '@/shared/api'

/** Paged visits list (+ optional city facet). */
export type VisitsPaginatedList = PaginatedList<Application> & {
  cities?: string[]
}
