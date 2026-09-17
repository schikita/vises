export { MailSlurpModule } from './mailslurp.module';
export {
  MAILSLURP_WAIT_FOR_EMAIL_MS,
  MAILSLURP_OTP_CONTENT_MATCH_PATTERN,
  MAILSLURP_OTP_BODY_FALLBACK_PATTERN,
} from './constants';
export type {
  MailSlurpInboxHandle,
  CreateMailSlurpInboxInput,
  WaitMailSlurpLatestEmailInput,
  WaitMailSlurpLatestEmailResult,
  ExtractMailSlurpOtpInput,
  ExtractMailSlurpOtpResult,
  DeleteMailSlurpInboxInput,
  DeleteMailSlurpInboxResult,
} from './types';
export {
  formatMailSlurpError,
  createMailSlurpInbox,
  waitMailSlurpLatestEmail,
  extractMailSlurpOtp,
  deleteMailSlurpInbox,
} from './utils';
