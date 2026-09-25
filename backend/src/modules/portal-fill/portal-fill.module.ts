import { Module, Provider } from '@nestjs/common';
import { CapMonsterModule } from '../capmonster';
import { BrowserMailModule } from '../browser-mail';
import { PortalCoreModule } from '../portal-core';
import { CAPTCHA_PROVIDER, PORTAL_FORM_FILLER } from './constants';
import { CaptchaAdapter } from './providers/capmonster-captcha-provider.adapter';
import { PortalBookingFillService } from './portal-booking-fill.service';
import { PortalFillService } from './portal-fill.service';
import { PortalLoginPrepFillService } from './portal-login-prep-fill.service';
import { PortalPasswordChangeFillService } from './portal-password-change-fill.service';
import { PortalStatusFillService } from './portal-status-fill.service';

const portalFillProviders: Provider[] = [
  PortalFillService,
  { provide: PORTAL_FORM_FILLER, useExisting: PortalFillService },
  PortalLoginPrepFillService,
  PortalPasswordChangeFillService,
  PortalStatusFillService,
  PortalBookingFillService,
  /** Purpose CaptchaProvider adapter (DEC-015 / DEC-004). */
  CaptchaAdapter,
  { provide: CAPTCHA_PROVIDER, useExisting: CaptchaAdapter },
];

/**
 * Patchright fill pipelines + captcha ownership
 * (portal-scrape-module-split DEC-004 / DEC-005 / REQ-005).
 * Does **not** import BlsClientsModule (cycle break).
 */
@Module({
  imports: [PortalCoreModule, BrowserMailModule, CapMonsterModule],
  providers: portalFillProviders,
  exports: [
    PortalFillService,
    PortalLoginPrepFillService,
    PortalPasswordChangeFillService,
    PortalStatusFillService,
    PortalBookingFillService,
    CaptchaAdapter,
    PORTAL_FORM_FILLER,
    CAPTCHA_PROVIDER,
  ],
})
export class PortalFillModule {}
