import { apiRequest } from '@/shared/api'
import { buildStaffListQuery } from '@/shared/lib'
import type { AppsPaginatedList } from '../types/apps-paginated-list.types'
import type { FetchAppsPageParams } from '../types/fetch-apps-page-params.types'

/** Staff paged GET /apps (always sends page for envelope mode). */
export const fetchAppsPage = (params: FetchAppsPageParams): Promise<AppsPaginatedList> =>
  apiRequest<AppsPaginatedList>(
    `/apps${buildStaffListQuery({
      page: params.page,
      pageSize: params.pageSize,
      q: params.q?.trim() || undefined,
      status: params.status && params.status !== 'all' ? params.status : undefined,
      city: params.city && params.city !== 'all' ? params.city : undefined,
      sort: params.sort,
      sortDir: params.sortDir,
    })}`,
  )
