/** Public API for portal-scrape (Nest HTTP evidence / login-prep façade). */
export { PortalScrapeModule } from './portal-scrape.module';
export { PortalAutofillController } from './portal-autofill.controller';
export { PortalAutofillService } from './portal-autofill.service';
export { PortalLoginPrepController } from './portal-login-prep.controller';
export { PortalLoginPrepService } from './portal-login-prep.service';
export { PortalConfigService } from '../portal-core';
export { PortalDataService } from '../portal-core';
export { PortalFieldMapperService } from '../portal-core';
export { SecretsCryptoService } from '../bls-secrets';
export { BlsSecretVaultService } from '../bls-secrets';
export {
  BlsWorkflowController,
  BlsWorkflowTerminalCleanupService,
  BlsWorkflowService,
  BlsWorkflowRepository,
  BlsWorkflowLockService,
} from '../bls-workflow';

export type {
  AutofillConfig,
  AutofillReport,
  MappingResult,
  PortalAutofillHttpInput,
  PortalAutofillHttpOutcome,
  PortalLoginPrepReport,
  PortalLoginPrepHttpOutcome,
  SecretEnvelope,
  PersistBlsSecretInput,
  LoadBlsSecretInput,
} from './types';

export {
  PORTAL_AUTOFILL,
  PORTAL_AUTOFILL_CONFIG,
  PORTAL_APPLICATION_DATA,
  PORTAL_FIELD_MAPPER,
  PORTAL_SITE_ADAPTER_REGISTRY,
} from './constants';

export type {
  IPortalAutofill,
  IPortalAutofillConfig,
  IPortalApplicationData,
  IPortalFieldMapper,
  IPortalSiteAdapter,
  IPortalSiteAdapterRegistry,
} from './interfaces';

export type {
  PortalClientPortalProgress,
  PortalSiteOutcome,
} from './types';

export { generatePortalPassword } from '../bls-secrets';
