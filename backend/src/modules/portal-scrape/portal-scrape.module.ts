import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CapMonsterModule } from '../capmonster';
import { Application } from '../database/entities/application.entity';
import { PortalAutofillRun } from '../database/entities/portal-autofill-run.entity';
import { User } from '../database/entities/user.entity';
import { MailTmModule } from '../mailtm';
import { SettingsModule } from '../settings/settings.module';
import { WebshareModule } from '../webshare';
import {
  PORTAL_AUTOFILL,
  PORTAL_AUTOFILL_CONFIG,
  PORTAL_APPLICATION_DATA,
  PORTAL_FIELD_MAPPER,
  PORTAL_FORM_FILLER,
  PORTAL_SITE_ADAPTER_REGISTRY,
} from './constants';
import { BelarusPortalSiteAdapter } from './belarus-portal-site.adapter';
import { PortalAutofillController } from './portal-autofill.controller';
import { PortalAutofillResumeReconciler } from './portal-autofill-resume.reconciler';
import { PortalAutofillService } from './portal-autofill.service';
import { PortalConfigService } from './portal-config.service';
import { PortalDataService } from './portal-data.service';
import { PortalFieldMapperService } from './portal-field-mapper.service';
import { PortalFillService } from './portal-fill.service';
import { PortalSiteAdapterRegistry } from './portal-site-adapter.registry';

const portalProviders = [
  PortalConfigService,
  { provide: PORTAL_AUTOFILL_CONFIG, useExisting: PortalConfigService },
  PortalDataService,
  { provide: PORTAL_APPLICATION_DATA, useExisting: PortalDataService },
  PortalFieldMapperService,
  {
    provide: PORTAL_FIELD_MAPPER,
    useExisting: PortalFieldMapperService,
  },
  PortalFillService,
  { provide: PORTAL_FORM_FILLER, useExisting: PortalFillService },
  BelarusPortalSiteAdapter,
  PortalSiteAdapterRegistry,
  {
    provide: PORTAL_SITE_ADAPTER_REGISTRY,
    useExisting: PortalSiteAdapterRegistry,
  },
  PortalAutofillService,
  { provide: PORTAL_AUTOFILL, useExisting: PortalAutofillService },
  /** Boot lock/status reconcile only — never launches browser (DEC-006). */
  PortalAutofillResumeReconciler,
];

/**
 * Nest portal RegisterUser autofill (prior DEC-008).
 * Primary trigger: authenticated HTTP (portal-autofill-api DEC-001).
 * Browsers launch only on-demand when the endpoint is invoked (REQ-011).
 * Boot reconciler clears stale locks / terminalizes expired rows (DEC-006).
 * User entity registered so JwtAuthGuard can resolve UserRepository (apps pattern).
 * CapMonster / Mail.tm / Webshare owned by integration modules (REQ-004–007).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Application, User, PortalAutofillRun]),
    AuthModule,
    SettingsModule,
    CapMonsterModule,
    MailTmModule,
    WebshareModule,
  ],
  controllers: [PortalAutofillController],
  providers: portalProviders,
  exports: [
    PortalAutofillService,
    PortalConfigService,
    PORTAL_AUTOFILL,
    PORTAL_AUTOFILL_CONFIG,
    PORTAL_SITE_ADAPTER_REGISTRY,
  ],
})
export class PortalScrapeModule {}
