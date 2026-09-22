/** Public API for portal-scrape (Nest HTTP autofill). */
export { PortalScrapeModule } from './portal-scrape.module';
export { PortalAutofillController } from './portal-autofill.controller';
export { PortalAutofillService } from './portal-autofill.service';
export { PortalLoginPrepController } from './portal-login-prep.controller';
export { PortalLoginPrepService } from './portal-login-prep.service';
export { BlsWorkflowController } from './bls-workflow.controller';
export { PortalConfigService } from './portal-config.service';
export { PortalDataService } from './portal-data.service';
export { PortalFieldMapperService } from './portal-field-mapper.service';
export { PortalFillService } from './portal-fill.service';
export { SecretsCryptoService } from './secrets-crypto.service';
export { BlsSecretVaultService } from './bls-secret-vault.service';
export { BlsWorkflowTerminalCleanupService } from './bls-workflow-terminal-cleanup.service';
export { BlsWorkflowService, BlsWorkflowRepository, BlsWorkflowLockService, BlsWorkflowRunner } from './workflow';
export {
  BlsWorkflowTaskExecutor,
  PROXY_PROVIDER,
  CAPTCHA_PROVIDER,
  BLS_REGISTER_CLIENT,
  BLS_LOGIN_CLIENT,
  BLS_PASSWORD_CHANGE_CLIENT,
  BLS_STATUS_CLIENT,
  BLS_BOOKING_CLIENT,
} from './bls-clients';

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
  BLS_WORKFLOW_TASK_EXECUTOR,
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
} from './bls-clients';
export type {
  PortalClientPortalProgress,
  PortalSiteOutcome,
} from './types';

export { generatePortalPassword } from './utils';
