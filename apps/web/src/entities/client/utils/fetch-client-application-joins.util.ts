import { buildClientApplicationJoin } from './build-client-application-join.util'
import { fetchClientDetail } from './fetch-client-detail.util'
import { fetchClientsList } from './fetch-clients-list.util'
import type { ClientApplicationJoin } from '../types/client-application-join.types'

/**
 * Load ClientDetailDto[] and build join rows for AppOut.id matching
 * `applicationId` (seeded-scale; FE10 / AC-9).
 */
export const fetchClientApplicationJoins = async (): Promise<
  ClientApplicationJoin[]
> => {
  const listItems = await fetchClientsList()
  const details = await Promise.all(
    listItems.map((row) => fetchClientDetail(row.id)),
  )
  return buildClientApplicationJoin(details)
}
