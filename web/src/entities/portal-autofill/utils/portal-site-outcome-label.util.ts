import { PORTAL_SITE_OUTCOME_LABEL_RU } from '../constants'
import type { PortalSiteOutcome } from '../types'

/** Russian label for site approval / outcome (REQ-005); Belarus → «недоступно». */
export const portalSiteOutcomeLabel = (outcome: PortalSiteOutcome): string =>
  PORTAL_SITE_OUTCOME_LABEL_RU[outcome.state] ?? outcome.state
