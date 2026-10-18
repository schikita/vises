import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BlsWorkflowModule } from '../bls-workflow';
import { Application } from '../database/entities/application.entity';
import { PortalAutofillRun } from '../database/entities/portal-autofill-run.entity';
import { User } from '../database/entities/user.entity';
import { PortalCoreModule } from '../portal-core';
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
 * API portal scrape façade (DEC-019): evidence list/download + login-prep reject.
 * No portal-fill / bls-clients / browser-mail / CapMonster on the API process.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Application, User, PortalAutofillRun]),
    AuthModule,
    PortalCoreModule,
    BlsWorkflowModule,
  ],
  controllers: [PortalAutofillController, PortalLoginPrepController],
  providers: portalProviders,
  exports: [
    PortalAutofillService,
    PortalLoginPrepService,
    PORTAL_AUTOFILL,
    PortalCoreModule,
    BlsWorkflowModule,
  ],
})
export class PortalScrapeModule {}
