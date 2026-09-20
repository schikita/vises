import type { PortalAutofillRetryEligibility } from '../types'

/** True when server eligibility allows a staff trigger action. */
export const isPortalAutofillActionEligible = (
  eligibility: PortalAutofillRetryEligibility,
): boolean =>
  eligibility.impliedMode !== 'none' &&
  (eligibility.canResume || eligibility.canStartOrSupersede)
