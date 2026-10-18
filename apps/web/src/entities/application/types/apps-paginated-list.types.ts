import type { Application } from './application.types'
import type { PaginatedList } from '@/shared/api'

/** Paged apps list (+ optional city facet from server). */
export type AppsPaginatedList = PaginatedList<Application> & {
  cities?: string[]
}
