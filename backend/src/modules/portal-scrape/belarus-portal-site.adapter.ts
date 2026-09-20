import { Injectable } from '@nestjs/common';
import { PORTAL_SITE_DISPLAY_NAME_BELARUS, PORTAL_SITE_ID_BELARUS } from './constants';
import type { IPortalSiteAdapter } from './interfaces';
import type {
  PortalSiteAdapterMatchContext,
  PortalSiteOutcome,
} from './types';
import { isPortalSubmitCountryBelarusAllowlisted } from './utils';

/**
 * Live Belarus RegisterUser/BLS site adapter (DEC-009 / A-MS-1).
 * Fill/captcha remain in shared portal-scrape services; this seam owns
 * country matching and honest site-outcome capability (DEC-002).
 */
@Injectable()
export class BelarusPortalSiteAdapter implements IPortalSiteAdapter {
  readonly siteId = PORTAL_SITE_ID_BELARUS;
  readonly displayName = PORTAL_SITE_DISPLAY_NAME_BELARUS;
  /** Belarus fill path cannot observe embassy approval yet. */
  readonly supportsSiteOutcomeProbe = false;

  matches(ctx: PortalSiteAdapterMatchContext): boolean {
    return isPortalSubmitCountryBelarusAllowlisted(ctx.submitCountry);
  }

  probeSiteOutcome(_ctx?: PortalSiteAdapterMatchContext): PortalSiteOutcome {
    return { state: 'not_available' };
  }
}
