import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../database/entities/application.entity';
import { BlsWorkflowStep } from '../database/entities/bls-workflow-step.entity';
import { PortalAutofillRun } from '../database/entities/portal-autofill-run.entity';
import { BelarusPortalSiteAdapter } from './belarus-portal-site.adapter';
import {
  PORTAL_APPLICATION_DATA,
  PORTAL_AUTOFILL_CONFIG,
  PORTAL_FIELD_MAPPER,
  PORTAL_SITE_ADAPTER_REGISTRY,
} from './constants/portal-di.tokens';
import { PortalAutofillRunPersistenceService } from './portal-autofill-run-persistence.service';
import { PortalConfigService } from './portal-config.service';
import { PortalDataService } from './portal-data.service';
import { PortalFieldMapperService } from './portal-field-mapper.service';
import { PortalSiteAdapterRegistry } from './portal-site-adapter.registry';

const portalCoreProviders: Provider[] = [
  PortalConfigService,
  { provide: PORTAL_AUTOFILL_CONFIG, useExisting: PortalConfigService },
  PortalDataService,
  { provide: PORTAL_APPLICATION_DATA, useExisting: PortalDataService },
  PortalFieldMapperService,
  {
    provide: PORTAL_FIELD_MAPPER,
    useExisting: PortalFieldMapperService,
  },
  BelarusPortalSiteAdapter,
  PortalSiteAdapterRegistry,
  {
    provide: PORTAL_SITE_ADAPTER_REGISTRY,
    useExisting: PortalSiteAdapterRegistry,
  },
  /** Shared portal_autofill_runs create/update + REGISTER soft link (DEC-012). */
  PortalAutofillRunPersistenceService,
];

/**
 * Shared portal config / data / mapper / site adapter + run persistence
 * (portal-scrape-module-split DEC-006 / REQ-006).
 * Leaf vs fill/clients/workflow; may use Settings/Config + TypeORM Application.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      PortalAutofillRun,
      BlsWorkflowStep,
    ]),
  ],
  providers: portalCoreProviders,
  exports: [
    PortalConfigService,
    PortalDataService,
    PortalFieldMapperService,
    BelarusPortalSiteAdapter,
    PortalSiteAdapterRegistry,
    PortalAutofillRunPersistenceService,
    PORTAL_AUTOFILL_CONFIG,
    PORTAL_APPLICATION_DATA,
    PORTAL_FIELD_MAPPER,
    PORTAL_SITE_ADAPTER_REGISTRY,
  ],
})
export class PortalCoreModule {}
