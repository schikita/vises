/**
 * PortalHttpModule — browserless (pure HTTP) implementation of the BLS flow.
 * Provides the same five client tokens (BLS_REGISTER_CLIENT, …) bound to HTTP
 * clients, so the parallel BlsHttpWorkflow engine consumes them unchanged.
 * The old patchright-based BlsClientsModule stays in place, untouched.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../database/entities/application.entity';
import { PortalCoreModule } from '../portal-core/portal-core.module';
import { BlsSecretsModule } from '../bls-secrets/bls-secrets.module';
import {
  BLS_BOOKING_CLIENT,
  BLS_LOGIN_CLIENT,
  BLS_PASSWORD_CHANGE_CLIENT,
  BLS_REGISTER_CLIENT,
  BLS_STATUS_CLIENT,
} from '../bls-clients/constants/bls-clients-di.tokens';
import { PortalHttpService } from './portal-http.service';
import { PortalHttpCaptchaService } from './portal-http-captcha.service';
import { TempMailPlusHttpAdapter } from './tempmail-plus-http.adapter';
import { PortalHttpFlowService } from './portal-http-flow.service';
import { BlsRegisterHttpClient } from './clients/bls-register-http.client';
import { BlsLoginHttpClient } from './clients/bls-login-http.client';
import { BlsPasswordChangeHttpClient } from './clients/bls-password-change-http.client';
import { BlsStatusHttpClient } from './clients/bls-status-http.client';
import { BlsBookingHttpClient } from './clients/bls-booking-http.client';

@Module({
  imports: [TypeOrmModule.forFeature([Application]), PortalCoreModule, BlsSecretsModule],
  providers: [
    PortalHttpService,
    PortalHttpCaptchaService,
    TempMailPlusHttpAdapter,
    PortalHttpFlowService,
    BlsRegisterHttpClient,
    { provide: BLS_REGISTER_CLIENT, useExisting: BlsRegisterHttpClient },
    BlsLoginHttpClient,
    { provide: BLS_LOGIN_CLIENT, useExisting: BlsLoginHttpClient },
    BlsPasswordChangeHttpClient,
    { provide: BLS_PASSWORD_CHANGE_CLIENT, useExisting: BlsPasswordChangeHttpClient },
    BlsStatusHttpClient,
    { provide: BLS_STATUS_CLIENT, useExisting: BlsStatusHttpClient },
    BlsBookingHttpClient,
    { provide: BLS_BOOKING_CLIENT, useExisting: BlsBookingHttpClient },
  ],
  exports: [
    PortalHttpService,
    PortalHttpCaptchaService,
    PortalHttpFlowService,
    BLS_REGISTER_CLIENT,
    BLS_LOGIN_CLIENT,
    BLS_PASSWORD_CHANGE_CLIENT,
    BLS_STATUS_CLIENT,
    BLS_BOOKING_CLIENT,
  ],
})
export class PortalHttpModule {}
