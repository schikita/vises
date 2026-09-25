import type {
  CreateTemporaryMailboxInput,
  DeleteTemporaryMailboxInput,
  DeleteTemporaryMailboxResult,
  ExtractTemporaryEmailOtpInput,
  ExtractTemporaryEmailOtpResult,
  ExtractTemporaryEmailPortalPasswordInput,
  ExtractTemporaryEmailPortalPasswordResult,
  TemporaryEmailCallOptions,
  TemporaryMailboxAccount,
  WaitTemporaryEmailMessageInput,
  WaitTemporaryEmailMessageResult,
} from '../types';

/**
 * Purpose-named temporary inbox + OTP / portal-password extraction port
 * (DEC-007 / REQ-002 / DEC-013 / DEC-015). Mail.tm is the default adapter.
 * Callers retain the mailbox after OTP success and delete only on terminal
 * cleanup / explicit admin (REQ-016).
 */
export interface TemporaryEmailProvider {
  createAccount(
    input: CreateTemporaryMailboxInput,
    options?: TemporaryEmailCallOptions,
  ): Promise<TemporaryMailboxAccount>;
  waitLatestMessage(
    input: WaitTemporaryEmailMessageInput,
    options?: TemporaryEmailCallOptions,
  ): Promise<WaitTemporaryEmailMessageResult>;
  extractOtp(input: ExtractTemporaryEmailOtpInput): ExtractTemporaryEmailOtpResult;
  extractPortalPassword(
    input: ExtractTemporaryEmailPortalPasswordInput,
  ): ExtractTemporaryEmailPortalPasswordResult;
  deleteAccount(
    input: DeleteTemporaryMailboxInput,
  ): Promise<DeleteTemporaryMailboxResult>;
  /**
   * Dispose provider session for contextKey (browser Map entry).
   * Mail.tm HTTP adapter: soft no-op success.
   */
  disposeSession(contextKey: string): Promise<DeleteTemporaryMailboxResult>;
}

/** Legacy alias — prefer `TemporaryEmailProvider`. */
export type IDisposableEmail = TemporaryEmailProvider;

/** Purpose alias per DEC-015. */
export type MailPort = TemporaryEmailProvider;
