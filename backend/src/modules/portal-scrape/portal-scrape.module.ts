import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BlsClientsModule } from '../bls-clients';
import { BlsSecretsModule } from '../bls-secrets';
import { BlsWorkflowModule } from '../bls-workflow';
import { BrowserMailModule } from '../browser-mail';
import { CapMonsterModule } from '../capmonster';
import { Application } from '../database/entities/application.entity';
import { PortalAutofillRun } from '../database/entities/portal-autofill-run.entity';
import { User } from '../database/entities/user.entity';
import { MailTmModule } from '../mailtm';
import { PortalCoreModule } from '../portal-core';
import { PortalFillModule } from '../portal-fill';
import { Proxy6Module } from '../proxy6';
import { SettingsModule } from '../settings/settings.module';
import { PORTAL_AUTOFILL } from './constants';
import { PortalAutofillResumeReconciler } from './portal-autofill-resume.reconciler';
import { PortalAutofillController } from './portal-autofill.controller';
import { PortalAutofillService } from './portal-autofill.service';
import { PortalLoginPrepController } from './portal-login-prep.controller';
import { PortalLoginPrepService } from './portal-login-prep.service';

const portalProviders: Provider[] = [
  PortalAutofillService,
  { provide: PORTAL_AUTOFILL, useExisting: PortalAutofillService },
  PortalLoginPrepService,
  /** Boot lock/status reconcile only — never launches browser (DEC-006). */
  PortalAutofillResumeReconciler,
];

/**
 * Nest portal scrape façade (portal-scrape-module-split DEC-002).
 * Composition imports only — autofill HTTP + login-prep HTTP stay here.
 * Child modules own workflow / clients / fill / core / secrets / browser-mail.
 * AppModule and AppsModule import this façade only.
 * Browsers launch only on-demand when HTTP or the workflow runner claims work.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Application, User, PortalAutofillRun]),
    AuthModule,
    SettingsModule,
    CapMonsterModule,
    MailTmModule,
    Proxy6Module,
    BlsSecretsModule,
    BrowserMailModule,
    PortalCoreModule,
    PortalFillModule,
    BlsClientsModule,
    BlsWorkflowModule,
  ],
  controllers: [PortalAutofillController, PortalLoginPrepController],
  providers: portalProviders,
  exports: [
    PortalAutofillService,
    PortalLoginPrepService,
    PORTAL_AUTOFILL,
    BlsSecretsModule,
    BrowserMailModule,
    PortalCoreModule,
    PortalFillModule,
    BlsClientsModule,
    BlsWorkflowModule,
  ],
})
export class PortalScrapeModule {}
