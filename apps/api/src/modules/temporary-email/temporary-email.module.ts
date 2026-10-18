import { Module } from '@nestjs/common';
import {
  DISPOSABLE_EMAIL,
  MAIL_PROVIDER,
  TEMPORARY_EMAIL_PROVIDER,
} from './constants';
import { NoOpTemporaryEmailProvider } from './noop-temporary-email.provider';

/**
 * API temporary-email bindings for terminal mailbox cleanup (no browser).
 */
@Module({
  providers: [
    NoOpTemporaryEmailProvider,
    {
      provide: TEMPORARY_EMAIL_PROVIDER,
      useExisting: NoOpTemporaryEmailProvider,
    },
    { provide: DISPOSABLE_EMAIL, useExisting: TEMPORARY_EMAIL_PROVIDER },
    { provide: MAIL_PROVIDER, useExisting: TEMPORARY_EMAIL_PROVIDER },
  ],
  exports: [
    NoOpTemporaryEmailProvider,
    TEMPORARY_EMAIL_PROVIDER,
    DISPOSABLE_EMAIL,
    MAIL_PROVIDER,
  ],
})
export class TemporaryEmailModule {}
