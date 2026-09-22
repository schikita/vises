import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CapMonsterModule } from '../capmonster';
import { Application } from '../database/entities/application.entity';
import { BlsSecretVault } from '../database/entities/bls-secret-vault.entity';
import { BlsWorkflowAttempt } from '../database/entities/bls-workflow-attempt.entity';
import { BlsWorkflow } from '../database/entities/bls-workflow.entity';
import { BlsWorkflowEvent } from '../database/entities/bls-workflow-event.entity';
import { BlsWorkflowStep } from '../database/entities/bls-workflow-step.entity';
import { BlsWorkflowTask } from '../database/entities/bls-workflow-task.entity';
import { PortalAutofillRun } from '../database/entities/portal-autofill-run.entity';
import { User } from '../database/entities/user.entity';
import { MailTmModule } from '../mailtm';
import { Proxy6Module } from '../proxy6';
import { SettingsModule } from '../settings/settings.module';
import {
  PORTAL_AUTOFILL,
  PORTAL_AUTOFILL_CONFIG,
  PORTAL_APPLICATION_DATA,
  PORTAL_FIELD_MAPPER,
  PORTAL_FORM_FILLER,
  PORTAL_SITE_ADAPTER_REGISTRY,
  BLS_WORKFLOW_TASK_EXECUTOR,
} from './constants';
import {
  BLS_BOOKING_CLIENT,
  BLS_LOGIN_CLIENT,
  BLS_PASSWORD_CHANGE_CLIENT,
  BLS_REGISTER_CLIENT,
  BLS_STATUS_CLIENT,
  BlsRegisterClientService,
  BlsLoginClientService,
  BlsPasswordChangeClientService,
  BlsBookingClientService,
  BlsStatusClientService,
  BlsWorkflowTaskExecutor,
  CAPTCHA_PROVIDER,
  CapMonsterCaptchaProviderAdapter,
  PROXY_PROVIDER,
  Proxy6ProxyProviderAdapter,
} from './bls-clients';
import { BelarusPortalSiteAdapter } from './belarus-portal-site.adapter';
import { BlsSecretVaultService } from './bls-secret-vault.service';
import { BlsWorkflowController } from './bls-workflow.controller';
import { BlsWorkflowReconciler } from './bls-workflow.reconciler';
import { BlsWorkflowTerminalCleanupService } from './bls-workflow-terminal-cleanup.service';
import { PortalAutofillController } from './portal-autofill.controller';
import { PortalAutofillResumeReconciler } from './portal-autofill-resume.reconciler';
import { PortalAutofillRunPersistenceService } from './portal-autofill-run-persistence.service';
import { PortalAutofillService } from './portal-autofill.service';
import { PortalConfigService } from './portal-config.service';
import { PortalDataService } from './portal-data.service';
import { PortalFieldMapperService } from './portal-field-mapper.service';
import { PortalFillService } from './portal-fill.service';
import { PortalLoginPrepController } from './portal-login-prep.controller';
import { PortalLoginPrepFillService } from './portal-login-prep-fill.service';
import { PortalLoginPrepService } from './portal-login-prep.service';
import { PortalPasswordChangeFillService } from './portal-password-change-fill.service';
import { PortalSiteAdapterRegistry } from './portal-site-adapter.registry';
import { PortalBookingFillService } from './portal-booking-fill.service';
import { PortalStatusFillService } from './portal-status-fill.service';
import { SecretsCryptoService } from './secrets-crypto.service';
import {
  BlsWorkflowLockService,
  BlsWorkflowRepository,
  BlsWorkflowRunner,
  BlsWorkflowService,
} from './workflow';

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
  /** Shared portal_autofill_runs create/update + REGISTER soft link (DEC-012). */
  PortalAutofillRunPersistenceService,
  PortalLoginPrepFillService,
  PortalLoginPrepService,
  PortalPasswordChangeFillService,
  PortalStatusFillService,
  PortalBookingFillService,
  /** Boot lock/status reconcile only — never launches browser (DEC-006). */
  PortalAutofillResumeReconciler,
  /** Boot workflow lock clear only — runner claims due work (DEC-018). */
  BlsWorkflowReconciler,
  /** Envelope encryption + vault persist/load (DEC-005 / TASK-005). */
  SecretsCryptoService,
  BlsSecretVaultService,
  /** Terminal Mail.tm + vault + events TTL cleanup (TASK-018 / REQ-016). */
  BlsWorkflowTerminalCleanupService,
  /** Durable workflow graph + state machine (TASK-002). */
  BlsWorkflowRepository,
  BlsWorkflowService,
  /** Workflow lock + attempt persistence (TASK-003 / DEC-003). */
  BlsWorkflowLockService,
  /** ProxyProvider / CaptchaProvider ports (DEC-017 / TASK-007). */
  Proxy6ProxyProviderAdapter,
  { provide: PROXY_PROVIDER, useExisting: Proxy6ProxyProviderAdapter },
  CapMonsterCaptchaProviderAdapter,
  { provide: CAPTCHA_PROVIDER, useExisting: CapMonsterCaptchaProviderAdapter },
  /** Domain BLS clients — REGISTER…BOOK live (BOOK = CON-006 safe stop). */
  BlsRegisterClientService,
  { provide: BLS_REGISTER_CLIENT, useExisting: BlsRegisterClientService },
  BlsLoginClientService,
  { provide: BLS_LOGIN_CLIENT, useExisting: BlsLoginClientService },
  BlsPasswordChangeClientService,
  {
    provide: BLS_PASSWORD_CHANGE_CLIENT,
    useExisting: BlsPasswordChangeClientService,
  },
  BlsStatusClientService,
  { provide: BLS_STATUS_CLIENT, useExisting: BlsStatusClientService },
  BlsBookingClientService,
  { provide: BLS_BOOKING_CLIENT, useExisting: BlsBookingClientService },
  /** Dispatcher executor → domain clients by step/task key (DEC-008). */
  BlsWorkflowTaskExecutor,
  {
    provide: BLS_WORKFLOW_TASK_EXECUTOR,
    useExisting: BlsWorkflowTaskExecutor,
  },
  /** In-process DB runner tick (TASK-004 / DEC-002) — no Bull/Redis. */
  BlsWorkflowRunner,
];
/**
 * Nest portal RegisterUser autofill (prior DEC-008).
 * Primary trigger: authenticated HTTP (portal-autofill-api DEC-001).
 * Login prep: POST …/portal-login-prep (portal-login-status-check DEC-002).
 * Browsers launch only on-demand when the endpoint is invoked (REQ-011).
 * Boot reconciler clears stale autofill locks / terminalizes expired rows (DEC-006).
 * Boot workflow reconciler clears stale bls_workflows locks; runner resumes due work (DEC-018).
 * User entity registered so JwtAuthGuard can resolve UserRepository (apps pattern).
 * CapMonster / Mail.tm / Proxy6 owned by integration modules (REQ-004–007).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      User,
      PortalAutofillRun,
      BlsSecretVault,
      BlsWorkflow,
      BlsWorkflowStep,
      BlsWorkflowTask,
      BlsWorkflowAttempt,
      BlsWorkflowEvent,
    ]),
    AuthModule,
    SettingsModule,
    CapMonsterModule,
    MailTmModule,
    Proxy6Module,
  ],
  controllers: [
    PortalAutofillController,
    PortalLoginPrepController,
    BlsWorkflowController,
  ],
  providers: portalProviders,
  exports: [
    PortalAutofillService,
    PortalLoginPrepService,
    PortalConfigService,
    SecretsCryptoService,
    BlsSecretVaultService,
    BlsWorkflowTerminalCleanupService,
    BlsWorkflowService,
    BlsWorkflowLockService,
    BlsWorkflowRunner,
    PORTAL_AUTOFILL,
    PORTAL_AUTOFILL_CONFIG,
    PORTAL_SITE_ADAPTER_REGISTRY,
    BLS_WORKFLOW_TASK_EXECUTOR,
    PROXY_PROVIDER,
    CAPTCHA_PROVIDER,
    BLS_REGISTER_CLIENT,
    BLS_LOGIN_CLIENT,
    BLS_PASSWORD_CHANGE_CLIENT,
    BLS_STATUS_CLIENT,
    BLS_BOOKING_CLIENT,
  ],
})
export class PortalScrapeModule {}
