import type {
  PortalSiteAdapterMatchContext,
  PortalSiteOutcome,
} from '../types';

/**
 * Country/site scrape adapter seam (REQ-015 / REQ-016 / DEC-009).
 * Belarus RegisterUser/BLS is the first implementation; Russia = future adapter.
 * Shared fill/lifecycle services remain outside this interface until a second site needs them.
 */
export interface IPortalSiteAdapter {
  readonly siteId: string;
  readonly displayName: string;
  /** When false, `probeSiteOutcome` must still return honest `not_available` (DEC-002). */
  readonly supportsSiteOutcomeProbe: boolean;
  matches(ctx: PortalSiteAdapterMatchContext): boolean;
  probeSiteOutcome(ctx?: PortalSiteAdapterMatchContext): PortalSiteOutcome;
}
