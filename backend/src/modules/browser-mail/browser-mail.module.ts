import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../config';
import { MailTmModule, MailTmService } from '../mailtm';
import {
  DISPOSABLE_EMAIL,
  MAIL_PROVIDER,
  TEMPORARY_EMAIL_PROVIDER,
} from '../mailtm';
import { BrowserMailAdapter } from './browser-mail.adapter';
import { BrowserMailSessionStore } from './browser-mail-session.store';
import {
  PORTAL_EMAIL_PROVIDER,
  type PortalEmailProviderValue,
} from './constants';
import { resolvePortalTemporaryEmailProvider } from './utils';

const browserMailProviders: Provider[] = [
  /** In-memory Patchright session Map for browser mail (DEC-002 / TASK-007). */
  BrowserMailSessionStore,
  /** tempmail.plus Patchright adapter (DEC-015 / TASK-008). */
  BrowserMailAdapter,
  /**
   * Temporary-email port factory (DEC-011 / REQ-010 / REQ-011).
   * `mailtm` → MailTmService; `tempmail_plus` → BrowserMailAdapter.
   * Token string/symbol identities unchanged (portal-scrape-module-split).
   */
  {
    provide: TEMPORARY_EMAIL_PROVIDER,
    useFactory: (
      config: ConfigService<AppEnv, true>,
      mailTm: MailTmService,
      browserMail: BrowserMailAdapter,
    ) => {
      const emailProvider = (config.get('VISES_PORTAL_EMAIL_PROVIDER', {
        infer: true,
      }) ?? PORTAL_EMAIL_PROVIDER.MAILTM) as PortalEmailProviderValue;
      return resolvePortalTemporaryEmailProvider({
        emailProvider,
        apiMailAdapter: mailTm,
        browserMailAdapter: browserMail,
      });
    },
    inject: [ConfigService, MailTmService, BrowserMailAdapter],
  },
  { provide: DISPOSABLE_EMAIL, useExisting: TEMPORARY_EMAIL_PROVIDER },
  { provide: MAIL_PROVIDER, useExisting: TEMPORARY_EMAIL_PROVIDER },
];

/**
 * Browser temporary-email (tempmail.plus) + TEMPORARY_EMAIL_PROVIDER factory
 * (portal-scrape-module-split DEC-001 / REQ-013).
 * Imports MailTmModule; mailtm MUST NOT import this module.
 */
@Module({
  imports: [MailTmModule],
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
