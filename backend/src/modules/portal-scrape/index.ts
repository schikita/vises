/** Public API for portal-scrape (Nest HTTP autofill façade). */
export { PortalScrapeModule } from './portal-scrape.module';
export { PortalAutofillController } from './portal-autofill.controller';
export { PortalAutofillService } from './portal-autofill.service';
export { PortalLoginPrepController } from './portal-login-prep.controller';
export { PortalLoginPrepService } from './portal-login-prep.service';
export { PortalConfigService } from '../portal-core';
export { PortalDataService } from '../portal-core';
export { PortalFieldMapperService } from '../portal-core';
export { PortalFillService } from '../portal-fill';
export { SecretsCryptoService } from '../bls-secrets';
export { BlsSecretVaultService } from '../bls-secrets';
export {
  BlsWorkflowController,
  BlsWorkflowTerminalCleanupService,
  BlsWorkflowService,
  BlsWorkflowRepository,
  BlsWorkflowLockService,
  BlsWorkflowRunner,
  BlsWorkflowTaskExecutor,
  BLS_WORKFLOW_TASK_EXECUTOR,
} from '../bls-workflow';
export {
  PROXY_PROVIDER,
  BLS_REGISTER_CLIENT,
  BLS_LOGIN_CLIENT,
  BLS_PASSWORD_CHANGE_CLIENT,
  BLS_STATUS_CLIENT,
  BLS_BOOKING_CLIENT,
} from '../bls-clients';
export { CAPTCHA_PROVIDER } from '../portal-fill';

export type {
  AutofillConfig,
  AutofillReport,
  FillRegisterFormOptions,
  FillRegisterFormResult,
  MappingResult,
  PortalAutofillHttpInput,
  PortalAutofillHttpOutcome,
  PortalLoginPrepReport,
  PortalLoginPrepHttpOutcome,
  SecretEnvelope,
  PersistBlsSecretInput,
  LoadBlsSecretInput,
  BlsWorkflowTaskExecutorInput,
  BlsWorkflowTaskExecutorResult,
} from './types';

export {
  PORTAL_AUTOFILL,
  PORTAL_AUTOFILL_CONFIG,
  PORTAL_APPLICATION_DATA,
  PORTAL_FIELD_MAPPER,
  PORTAL_FORM_FILLER,
  PORTAL_SITE_ADAPTER_REGISTRY,
} from './constants';

export type {
  IPortalAutofill,
  IPortalAutofillConfig,
  IPortalApplicationData,
  IPortalFieldMapper,
  IPortalFormFiller,
  IPortalSiteAdapter,
  IPortalSiteAdapterRegistry,
  IBlsWorkflowTaskExecutor,
} from './interfaces';

export type {
  ProxyProvider,
  CaptchaProvider,
  BlsRegisterClient,
  BlsLoginClient,
  BlsPasswordChangeClient,
  BlsStatusClient,
  BlsBookingClient,
} from '../bls-clients';
export type {
  PortalClientPortalProgress,
  PortalSiteOutcome,
} from './types';

export { generatePortalPassword } from '../bls-secrets';
