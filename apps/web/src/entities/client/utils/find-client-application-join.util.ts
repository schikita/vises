import type { ClientApplicationJoin } from '../types/client-application-join.types'

export const findClientApplicationJoin = (
  rows: ClientApplicationJoin[],
  applicationId: string,
): ClientApplicationJoin | null =>
  rows.find((row) => row.applicationId === applicationId) ?? null
