import type { MailTmCircuitBreaker } from './mailtm-circuit.types';

/**
 * Vendor-agnostic temporary-email port I/O (REQ-002 / DEC-010 / DEC-013).
 * Mail.tm HTTP DTOs remain in mailtm.types.ts; adapters map to these shapes.
 */

/** Created mailbox handle returned by TemporaryEmailProvider.createAccount. */
export type TemporaryMailboxAccount = {
  id: string;
  address: string;
  /**
   * Provider API token when applicable; empty string for browser mode
   * (DEC-006 — no MAILTM_* vault for browser accounts).
   */
  token: string;
  /**
   * Mailbox password when applicable; empty string for browser mode.
   * Never log, report, or HTTP-return this value.
   */
  password: string;
};

export type CreateTemporaryMailboxInput = {
  /** Workflow id (or run-scoped key) for browser session reuse (DEC-004). */
  contextKey: string;
};

/**
 * Optional run-scoped call options. `circuit` is interpreted by the Mail.tm
 * HTTP adapter; browser adapter ignores it.
 */
export type TemporaryEmailCallOptions = {
  circuit?: MailTmCircuitBreaker;
};

export type WaitTemporaryEmailMessageInput = {
  contextKey: string;
  /** Bearer / provider token; may be empty for browser mode. */
  token: string;
  /** Max wait ms. */
  timeoutMs: number;
  /** Prefer unread when true (default). */
  unreadOnly?: boolean;
  /**
   * Message ids to ignore (e.g. prior EmailOtp mail when waiting for the
   * post-registration portal password email).
   */
  excludeMessageIds?: string[];
};

export type WaitTemporaryEmailMessageResult = {
  messageId: string;
  /**
   * Combined text/html body for OTP extract. Callers must not log this
   * (NFR-001); pass only into extractOtp / extractPortalPassword.
   */
  body: string;
};

export type ExtractTemporaryEmailOtpInput = {
  body: string;
};

export type ExtractTemporaryEmailOtpResult =
  | {
      ok: true;
      otp: string;
      source: 'cue' | 'body-fallback';
    }
  | {
      ok: false;
      reason: string;
    };

export type ExtractTemporaryEmailPortalPasswordInput = {
  body: string;
};

export type ExtractTemporaryEmailPortalPasswordResult =
  | {
      ok: true;
      password: string;
      source: 'cue' | 'body-fallback';
    }
  | {
      ok: false;
      reason: string;
    };

export type DeleteTemporaryMailboxInput = {
  contextKey: string;
  accountId?: string;
  token?: string;
  /** Optional re-auth when accountId cannot be resolved from token alone. */
  address?: string;
  password?: string;
};

/** Soft-fail delete / dispose outcome. Never throws to caller. */
export type DeleteTemporaryMailboxResult = {
  ok: boolean;
  /** Soft-fail detail; never includes token/password. */
  warnMessage?: string;
};
