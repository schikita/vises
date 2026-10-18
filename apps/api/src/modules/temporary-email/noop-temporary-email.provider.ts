import { Injectable } from '@nestjs/common';
import type { TemporaryEmailProvider } from './interfaces';
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
} from './types';
import {
  extractTemporaryEmailOtp,
  extractTemporaryEmailPortalPassword,
} from './utils';

/**
 * API-side temporary-email adapter: no browser / no remote mailbox API.
 * Terminal cleanup uses dispose/delete as soft no-ops; OTP extract stays pure.
 */
@Injectable()
export class NoOpTemporaryEmailProvider implements TemporaryEmailProvider {
  async createAccount(
    _input: CreateTemporaryMailboxInput,
    _options?: TemporaryEmailCallOptions,
  ): Promise<TemporaryMailboxAccount> {
    throw new Error(
      'Temporary mailbox create is not available on the API process',
    );
  }

  async waitLatestMessage(
    _input: WaitTemporaryEmailMessageInput,
    _options?: TemporaryEmailCallOptions,
  ): Promise<WaitTemporaryEmailMessageResult> {
    throw new Error(
      'Temporary mailbox wait is not available on the API process',
    );
  }

  extractOtp(input: ExtractTemporaryEmailOtpInput): ExtractTemporaryEmailOtpResult {
    return extractTemporaryEmailOtp(input);
  }

  extractPortalPassword(
    input: ExtractTemporaryEmailPortalPasswordInput,
  ): ExtractTemporaryEmailPortalPasswordResult {
    return extractTemporaryEmailPortalPassword(input);
  }

  async deleteAccount(
    _input: DeleteTemporaryMailboxInput,
  ): Promise<DeleteTemporaryMailboxResult> {
    return {
      ok: true,
      warnMessage: 'api_mailbox_delete_noop',
    };
  }

  async disposeSession(
    _contextKey: string,
  ): Promise<DeleteTemporaryMailboxResult> {
    return { ok: true };
  }
}
