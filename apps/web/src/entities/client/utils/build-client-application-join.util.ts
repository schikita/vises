import type { ClientDetailDto } from '@vises/contracts'
import type { ClientApplicationJoin } from '../types/client-application-join.types'

/** Map client details → join rows keyed by applicationId (FE10 / AC-9). */
export const buildClientApplicationJoin = (
  details: ClientDetailDto[],
): ClientApplicationJoin[] =>
  details.map(
    (detail): ClientApplicationJoin => ({
      applicationId: detail.applicationId,
      clientId: detail.id,
      firstName: detail.firstName,
      lastName: detail.lastName,
    }),
  )
