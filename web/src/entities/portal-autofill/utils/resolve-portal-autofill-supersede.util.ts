import type { PortalAutofillRetryEligibility } from '../types'

/**
 * Whether POST should send `supersede: true` (DEC-008).
 * Only `impliedMode === 'supersede'` — never claim resume for CB-open paths.
 */
export const resolvePortalAutofillSupersede = (
  eligibility: PortalAutofillRetryEligibility,
): boolean => eligibility.impliedMode === 'supersede'
