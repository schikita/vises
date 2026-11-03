import type { ClientsListDto, ClientsListQuery } from '@vises/contracts'
import { apiRequest } from '@/shared/api'
import { buildStaffListQuery } from '@/shared/lib'

/** GET /clients → paginated `ClientsListDto` (qa-polish DEC-P3). */
export const fetchClientsList = (
  query: ClientsListQuery = {},
): Promise<ClientsListDto> =>
  apiRequest<ClientsListDto>(
    `/clients${buildStaffListQuery({
      page: query.page,
      pageSize: query.pageSize,
      search: query.search?.trim() || undefined,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
    })}`,
  )
