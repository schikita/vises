import type { ClientListDto } from '@vises/contracts'
import { CLIENTS_JOIN_PAGE_SIZE } from '../constants/clients-join-page-size.constants'
import type { ClientApplicationJoin } from '../types/client-application-join.types'
import { buildClientApplicationJoin } from './build-client-application-join.util'
import { fetchClientDetail } from './fetch-client-detail.util'
import { fetchClientsList } from './fetch-clients-list.util'

/**
 * Load ClientDetailDto[] and build join rows for AppOut.id matching
 * `applicationId` (seeded-scale; FE10 / AC-9). Walks paginated GET /clients.
 */
export const fetchClientApplicationJoins = async (): Promise<
  ClientApplicationJoin[]
> => {
  const listItems: ClientListDto[] = []
  let page = 1
  let total = Number.POSITIVE_INFINITY

  while (listItems.length < total) {
    const pageResult = await fetchClientsList({
      page,
      pageSize: CLIENTS_JOIN_PAGE_SIZE,
    })
    listItems.push(...pageResult.items)
    total = pageResult.total
    if (pageResult.items.length === 0) {
      break
    }
    page += 1
  }

  const details = await Promise.all(
    listItems.map((row) => fetchClientDetail(row.id)),
  )
  return buildClientApplicationJoin(details)
}
