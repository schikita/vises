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

/** Vendor-agnostic disposable inbox + OTP extraction port. */
export interface IDisposableEmail {
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
