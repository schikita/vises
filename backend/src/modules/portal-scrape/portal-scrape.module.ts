import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CapMonsterModule } from '../capmonster';
import { Application } from '../database/entities/application.entity';
import { PortalAutofillRun } from '../database/entities/portal-autofill-run.entity';
import { User } from '../database/entities/user.entity';
import { MailSlurpModule } from '../mailslurp';
import { SettingsModule } from '../settings/settings.module';
import { WebshareModule } from '../webshare';
import {
  PORTAL_AUTOFILL_SERVICE,
  PORTAL_CONFIG_SERVICE,
  PORTAL_DATA_SERVICE,
  PORTAL_FIELD_MAPPER_SERVICE,
  PORTAL_FILL_SERVICE,
} from './constants';
import { PortalAutofillController } from './portal-autofill.controller';
import { PortalAutofillService } from './portal-autofill.service';
import { PortalConfigService } from './portal-config.service';
import { PortalDataService } from './portal-data.service';
import { PortalFieldMapperService } from './portal-field-mapper.service';
import { PortalFillService } from './portal-fill.service';

const portalProviders = [
  PortalConfigService,
  { provide: PORTAL_CONFIG_SERVICE, useExisting: PortalConfigService },
  PortalDataService,
  { provide: PORTAL_DATA_SERVICE, useExisting: PortalDataService },
  PortalFieldMapperService,
  {
    provide: PORTAL_FIELD_MAPPER_SERVICE,
    useExisting: PortalFieldMapperService,
  },
  PortalFillService,
  { provide: PORTAL_FILL_SERVICE, useExisting: PortalFillService },
  PortalAutofillService,
  { provide: PORTAL_AUTOFILL_SERVICE, useExisting: PortalAutofillService },
];

/**
 * Nest portal RegisterUser autofill (prior DEC-008).
 * Primary trigger: authenticated HTTP (portal-autofill-api DEC-001).
 * Browsers launch only on-demand when the endpoint is invoked (REQ-011).
 * User entity registered so JwtAuthGuard can resolve UserRepository (apps pattern).
 * CapMonster / MailSlurp / Webshare owned by integration modules (REQ-004–007).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Application, User, PortalAutofillRun]),
    AuthModule,
    SettingsModule,
    CapMonsterModule,
    MailSlurpModule,
    WebshareModule,
  ],
  controllers: [PortalAutofillController],
  providers: portalProviders,
  exports: [
    PortalAutofillService,
    PortalConfigService,
    PORTAL_AUTOFILL_SERVICE,
    PORTAL_CONFIG_SERVICE,
  ],
})
export class PortalScrapeModule {}
