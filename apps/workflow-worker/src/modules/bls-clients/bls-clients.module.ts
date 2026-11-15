import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlsSecretsModule } from '../bls-secrets';
import { BrowserMailModule } from '../browser-mail';
import { Application } from '../database/entities/application.entity';
import { BlsWorkflowTask } from '../database/entities/bls-workflow-task.entity';
import { Client } from '../database/entities/client.entity';
import { PortalCoreModule } from '../portal-core';
import { PortalFillModule } from '../portal-fill';
import { Proxy6Module } from '../proxy6';
import {
  BLS_BOOKING_CLIENT,
  BLS_LOGIN_CLIENT,
  BLS_PASSWORD_CHANGE_CLIENT,
  BLS_REGISTER_CLIENT,
  BLS_STATUS_CLIENT,
  PROXY_PROVIDER,
} from './constants';
import { BlsBookingClientService } from './booking/bls-booking-client.service';
import { BlsLoginClientService } from './login/bls-login-client.service';
import { BlsPasswordChangeClientService } from './password-change/bls-password-change-client.service';
import { ProxyAdapter } from './providers/proxy6-proxy-provider.adapter';
import { BlsRegisterClientService } from './register/bls-register-client.service';
import { BlsStatusClientService } from './status/bls-status-client.service';

const blsClientsProviders: Provider[] = [
  /** ProxyPort purpose adapter (DEC-015 / DEC-017). */
  ProxyAdapter,
  { provide: PROXY_PROVIDER, useExisting: ProxyAdapter },
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
];

/**
 * Domain BLS clients + proxy ownership
 * (portal-scrape-module-split DEC-001 / DEC-004 / REQ-004).
 * Does **not** Nest-import BlsWorkflowModule (cycle break).
 * Stub clients remain unwired.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Application, Client, BlsWorkflowTask]),
    PortalFillModule,
    PortalCoreModule,
    BlsSecretsModule,
    BrowserMailModule,
    Proxy6Module,
  ],
  providers: blsClientsProviders,
  exports: [
    ProxyAdapter,
    PROXY_PROVIDER,
    BlsRegisterClientService,
    BlsLoginClientService,
    BlsPasswordChangeClientService,
    BlsStatusClientService,
    BlsBookingClientService,
    BLS_REGISTER_CLIENT,
    BLS_LOGIN_CLIENT,
    BLS_PASSWORD_CHANGE_CLIENT,
    BLS_STATUS_CLIENT,
    BLS_BOOKING_CLIENT,
  ],
})
export class BlsClientsModule {}
