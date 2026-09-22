import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DISPOSABLE_EMAIL, TEMPORARY_EMAIL_PROVIDER } from './constants';
import { MailTmService } from './mailtm.service';

/**
 * Mail.tm temporary email + OTP client (HttpModule / axios).
 * Exports MailTmService as TemporaryEmailProvider adapter (DEC-007).
 * Attribution: https://mail.tm
 */
@Module({
  imports: [HttpModule],
  providers: [
    MailTmService,
    { provide: TEMPORARY_EMAIL_PROVIDER, useExisting: MailTmService },
    { provide: DISPOSABLE_EMAIL, useExisting: MailTmService },
  ],
  exports: [MailTmService, TEMPORARY_EMAIL_PROVIDER, DISPOSABLE_EMAIL],
})
export class MailTmModule {}
