import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DISPOSABLE_EMAIL } from './constants';
import { MailTmService } from './mailtm.service';

/**
 * Mail.tm disposable email + OTP client (HttpModule / axios).
 * Exports MailTmService as IDisposableEmail adapter.
 * Attribution: https://mail.tm
 */
@Module({
  imports: [HttpModule],
  providers: [
    MailTmService,
    { provide: DISPOSABLE_EMAIL, useExisting: MailTmService },
  ],
  exports: [MailTmService, DISPOSABLE_EMAIL],
})
export class MailTmModule {}
