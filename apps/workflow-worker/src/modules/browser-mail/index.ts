/**
 * Public API for browser-mail (tempmail.plus + TEMPORARY_EMAIL factory).
 * temporary-email HTTP MUST NOT import this module (REQ-013).
 */

export { BrowserMailModule } from './browser-mail.module';
export { BrowserMailAdapter } from './browser-mail.adapter';
export { BrowserMailSessionStore } from './browser-mail-session.store';

export {
  TEMPORARY_EMAIL_PROVIDER,
  DISPOSABLE_EMAIL,
  MAIL_PROVIDER,
  TEMPORARY_EMAIL_WAIT_FOR_EMAIL_MS,
} from '../temporary-email';

export type {
  TemporaryEmailProvider,
  IDisposableEmail,
  MailPort,
  TemporaryMailboxAccount,
  CreateTemporaryMailboxInput,
  TemporaryEmailCallOptions,
  WaitTemporaryEmailMessageInput,
  WaitTemporaryEmailMessageResult,
  ExtractTemporaryEmailOtpInput,
  ExtractTemporaryEmailOtpResult,
  ExtractTemporaryEmailPortalPasswordInput,
  ExtractTemporaryEmailPortalPasswordResult,
  DeleteTemporaryMailboxInput,
  DeleteTemporaryMailboxResult,
} from '../temporary-email';

export {
  BROWSER_MAIL_BASE_URL,
  BROWSER_MAIL_SESSION_CLOSED_ERROR,
  BROWSER_MAIL_SESSION_MISSING_ERROR,
  BROWSER_MAIL_UI_PACE_MS,
  PORTAL_EMAIL_PROVIDER,
  type PortalEmailProviderValue,
} from './constants';

export type {
  BrowserMailBrowser,
  BrowserMailBrowserContext,
  BrowserMailChromium,
  BrowserMailLocator,
  BrowserMailPage,
  BrowserMailPatchrightModule,
  BrowserMailLetter,
  BrowserMailSession,
} from './types';
