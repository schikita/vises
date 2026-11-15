import type { RefinementCtx } from 'zod'
import { APPLICATION_FORM_MESSAGES } from '../constants/form-messages.constants'
import type { PortalTravelArrivalRefineData } from '../types/portal-travel-arrival-refine.types'
import { isNonEmptyTrimmed } from './is-non-empty-trimmed.util'

/**
 * Travel Date and Intended Arrival must stay synchronized to one store (AC-06).
 */
export const refinePortalTravelArrivalSync = (
  data: PortalTravelArrivalRefineData,
  ctx: RefinementCtx,
): void => {
  if (
    !isNonEmptyTrimmed(data.travelDate) ||
    !isNonEmptyTrimmed(data.intendedArrivalDate)
  ) {
    return
  }
  if (data.travelDate.trim() === data.intendedArrivalDate.trim()) return
  ctx.addIssue({
    code: 'custom',
    path: ['intendedArrivalDate'],
    message: APPLICATION_FORM_MESSAGES.intendedArrivalMustMatchTravelDate,
  })
}
