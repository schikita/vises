import { Module } from '@nestjs/common';
import { AppConfigModule } from './modules/config';
import { LoggerModule } from './modules/logger';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { CapMonsterModule } from './modules/capmonster';
import { TemporaryEmailModule } from './modules/temporary-email';
import { Proxy6Module } from './modules/proxy6';
import { BlsSecretsModule } from './modules/bls-secrets';
import { BrowserMailModule } from './modules/browser-mail';
import { PortalCoreModule } from './modules/portal-core';
import { PortalFillModule } from './modules/portal-fill';
import { BlsClientsModule } from './modules/bls-clients';
import { BlsWorkflowModule } from './modules/bls-workflow';
import { MessagingModule } from './modules/messaging';

/**
 * Portal / workflow worker process (DEC-019).
 * Boots claim/runner + fill/clients/mail — no CRM HTTP surface.
 */
@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    DatabaseModule,
    HealthModule,
    CapMonsterModule,
    TemporaryEmailModule,
    Proxy6Module,
    BlsSecretsModule,
    BrowserMailModule,
    PortalCoreModule,
    PortalFillModule,
    BlsClientsModule,
    BlsWorkflowModule,
    MessagingModule,
  ],
})
export class AppModule {}
