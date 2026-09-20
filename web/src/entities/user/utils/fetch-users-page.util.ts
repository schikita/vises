import { apiRequest } from '@/shared/api'
import { buildStaffListQuery } from '@/shared/lib'
import type { FetchUsersPageParams } from '../types/fetch-users-page-params.types'
import type { UsersPaginatedList } from '../types/users-paginated-list.types'

/** Admin paged GET /users (always sends page for envelope mode). */
export const fetchUsersPage = (params: FetchUsersPageParams): Promise<UsersPaginatedList> =>
  apiRequest<UsersPaginatedList>(
    `/users${buildStaffListQuery({
      page: params.page,
      pageSize: params.pageSize,
      q: params.q?.trim() || undefined,
      role: params.role && params.role !== 'all' ? params.role : undefined,
      sort: params.sort,
      sortDir: params.sortDir,
    })}`,
  )
