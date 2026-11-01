import type { ClientApplicationJoin } from '../types/client-application-join.types'
import { buildClientApplicationJoin } from './build-client-application-join.util'
import { fetchClientDetail } from './fetch-client-detail.util'
import { fetchClientsList } from './fetch-clients-list.util'

/**
 * Load ClientDetailDto[] and build join rows for AppOut.id matching
 * `applicationId` (seeded-scale; FE10 / AC-9).
 */
export const fetchClientApplicationJoins = async (): Promise<
  ClientApplicationJoin[]
> => {
  const list = await fetchClientsList()
  const details = await Promise.all(
    list.map((row) => fetchClientDetail(row.id)),
  )
  return buildClientApplicationJoin(details)
}
