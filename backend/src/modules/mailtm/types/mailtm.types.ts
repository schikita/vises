/**
 * Mail.tm REST I/O shapes (DEC-002 / DEC-006 / DEC-008 / DEC-009).
 * Never place passwords, Bearer tokens, or raw bodies in reports (NFR-001).
 */

export type MailTmAccountHandle = {
  id: string;
  address: string;
  token: string;
};

export type FetchMailTmJsonInput = {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  /** Bearer token when required (never log). */
  token?: string;
  body?: unknown;
  /** Remaining timeout budget for AbortController (ms). */
  remainingMs: number;
  /** Secret strings to redact from thrown error messages. */
  redactSecrets?: string[];
};

export type FetchMailTmJsonResult = {
  status: number;
  ok: boolean;
  /** Parsed JSON when body is non-empty JSON; otherwise undefined. */
  data: unknown;
  /** Retry-After header seconds when present (e.g. 429). */
  retryAfterSeconds?: number;
};

export type MailTmDomainMember = {
  id?: string;
  domain?: string;
  isActive?: boolean;
  isPrivate?: boolean;
};

export type MailTmHydraCollection = {
  'hydra:member'?: MailTmDomainMember[];
};

export type MailTmMessageSummary = {
  id?: string;
  seen?: boolean;
  createdAt?: string;
  intro?: string;
};

export type MailTmMessagesCollection = {
  'hydra:member'?: MailTmMessageSummary[];
  'hydra:totalItems'?: number;
};

export type MailTmMessageDetail = {
  id?: string;
  subject?: string;
  text?: string;
  html?: string[];
  seen?: boolean;
  intro?: string;
};

export type CreateMailTmAccountResult = MailTmAccountHandle;

export type WaitMailTmLatestMessageInput = {
  token: string;
  /** Max wait ms (DEC-003). Defaults to MAILTM_WAIT_FOR_EMAIL_MS when omitted by caller. */
  timeoutMs: number;
  /** Prefer unread when true (default). */
  unreadOnly?: boolean;
};

export type WaitMailTmLatestMessageResult = {
  messageId: string;
  /**
   * Combined text/html body for OTP extract. Callers must not log this
   * (NFR-001); pass only into extractOtp / extractMailTmOtp.
   */
  body: string;
};

export type ExtractMailTmOtpInput = {
  body: string;
};

export type ExtractMailTmOtpResult =
  | {
      ok: true;
      otp: string;
      source: 'cue' | 'body-fallback';
    }
  | {
      ok: false;
      reason: string;
    };

export type DeleteMailTmAccountInput = {
  accountId: string;
  token: string;
};

/** Soft-fail delete outcome (REQ-010). Never throws to caller. */
export type DeleteMailTmAccountResult = {
  ok: boolean;
  /** Soft-fail detail; never includes token/password. */
  warnMessage?: string;
};
