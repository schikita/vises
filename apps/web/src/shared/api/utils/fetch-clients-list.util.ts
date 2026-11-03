import type { ClientsListDto, ClientsListQuery } from '@vises/contracts'
import { buildStaffListQuery } from '@/shared/lib'
import { apiRequest } from '../http-client'

/** Typed skeleton: `GET /clients` → paginated `ClientsListDto` (DEC-P3). */
export const fetchClientsList = (
  query: ClientsListQuery = {},
): Promise<ClientsListDto> =>
  apiRequest<ClientsListDto>(
    `/clients${buildStaffListQuery({
      page: query.page,
      pageSize: query.pageSize,
      search: query.search?.trim() || undefined,
      sortBy: query.sortBy,
    })}`,
  )
