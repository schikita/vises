import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MailTmService } from './mailtm.service';

/**
 * Mail.tm temporary email + OTP HTTP client (HttpModule / axios).
 * Exports MailTmService for BrowserMailModule factory binding
 * (portal-scrape-module-split REQ-013).
 * TEMPORARY_EMAIL_PROVIDER is bound in BrowserMailModule, not here.
 * Attribution: https://mail.tm
 */
@Module({
  imports: [HttpModule],
  providers: [MailTmService],
  exports: [MailTmService],
})
export class MailTmModule {}
