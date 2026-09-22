import type {
  CreateMailTmAccountResult,
  DeleteMailTmAccountInput,
  DeleteMailTmAccountResult,
  ExtractMailTmOtpInput,
  ExtractMailTmOtpResult,
  MailTmCircuitCallOptions,
  WaitMailTmLatestMessageInput,
  WaitMailTmLatestMessageResult,
} from '../types';

/**
 * Vendor-agnostic temporary inbox + OTP extraction port (DEC-007 / REQ-015).
 * Mail.tm is the default adapter. Callers retain the mailbox after OTP success
 * and delete only on terminal cleanup / explicit admin (REQ-016).
 */
export interface TemporaryEmailProvider {
  createAccount(
    options?: MailTmCircuitCallOptions,
  ): Promise<CreateMailTmAccountResult>;
  waitLatestMessage(
    input: WaitMailTmLatestMessageInput,
    options?: MailTmCircuitCallOptions,
  ): Promise<WaitMailTmLatestMessageResult>;
  extractOtp(input: ExtractMailTmOtpInput): ExtractMailTmOtpResult;
  deleteAccount(
    input: DeleteMailTmAccountInput,
  ): Promise<DeleteMailTmAccountResult>;
}

/** Legacy alias — prefer `TemporaryEmailProvider`. */
export type IDisposableEmail = TemporaryEmailProvider;
