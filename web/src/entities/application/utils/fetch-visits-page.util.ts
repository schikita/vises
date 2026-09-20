import { apiRequest } from '@/shared/api'
import { buildStaffListQuery } from '@/shared/lib'
import type { FetchVisitsPageParams } from '../types/fetch-visits-page-params.types'
import type { VisitsPaginatedList } from '../types/visits-paginated-list.types'

/** Staff paged GET /visits. */
export const fetchVisitsPage = (params: FetchVisitsPageParams): Promise<VisitsPaginatedList> =>
  apiRequest<VisitsPaginatedList>(
    `/visits${buildStaffListQuery({
      page: params.page,
      pageSize: params.pageSize,
      q: params.q?.trim() || undefined,
      city: params.city && params.city !== 'all' ? params.city : undefined,
      mode: params.mode,
      sort: params.sort,
      sortDir: params.sortDir,
    })}`,
  )
