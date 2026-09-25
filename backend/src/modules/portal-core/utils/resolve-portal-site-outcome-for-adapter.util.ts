import type { IPortalSiteAdapter } from '../interfaces';
import type {
  PortalSiteAdapterMatchContext,
  PortalSiteOutcome,
} from '../types';

/**
 * Resolve site outcome from the active adapter (REQ-005 / DEC-002 / TASK-013).
 * Missing adapter → honest `not_available` (fail-closed display, not CRM declined).
 */
export const resolvePortalSiteOutcomeForAdapter = (
  adapter: IPortalSiteAdapter | null,
  ctx: PortalSiteAdapterMatchContext,
): PortalSiteOutcome => {
  if (adapter == null) {
    return { state: 'not_available' };
  }
  return adapter.probeSiteOutcome(ctx);
};
