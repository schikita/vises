import { Module, Provider } from '@nestjs/common';
import {
  DISPOSABLE_EMAIL,
  MAIL_PROVIDER,
  TEMPORARY_EMAIL_PROVIDER,
} from '../temporary-email';
import { PortalCoreModule } from '../portal-core';
import { BrowserMailAdapter } from './browser-mail.adapter';
import { BrowserMailSessionStore } from './browser-mail-session.store';

const browserMailProviders: Provider[] = [
  BrowserMailSessionStore,
  BrowserMailAdapter,
  {
    provide: TEMPORARY_EMAIL_PROVIDER,
    useExisting: BrowserMailAdapter,
  },
  { provide: DISPOSABLE_EMAIL, useExisting: TEMPORARY_EMAIL_PROVIDER },
  { provide: MAIL_PROVIDER, useExisting: TEMPORARY_EMAIL_PROVIDER },
];

/**
 * Browser temporary-email (tempmail.plus) bound as TEMPORARY_EMAIL_PROVIDER.
 */
@Module({
  imports: [PortalCoreModule],
  providers: browserMailProviders,
  exports: [
    BrowserMailSessionStore,
    BrowserMailAdapter,
    TEMPORARY_EMAIL_PROVIDER,
    DISPOSABLE_EMAIL,
    MAIL_PROVIDER,
  ],
})
export class BrowserMailModule {}
