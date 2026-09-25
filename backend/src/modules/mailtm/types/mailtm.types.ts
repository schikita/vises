/**
 * Mail.tm REST I/O shapes (DEC-002 / DEC-006 / DEC-008 / DEC-009).
 * Port-facing types live in temporary-email.types.ts (REQ-002).
 * Never place passwords, Bearer tokens, or raw bodies in reports (NFR-001).
 */

export type MailTmAccountHandle = {
  id: string;
  address: string;
  token: string;
  /**
   * Mailbox password for retain / re-auth (REQ-016).
   * Never log, report, or HTTP-return this value.
   */
  password: string;
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

/** Soft-fail login input for terminal cleanup re-auth (REQ-016). */
export type LoginMailTmAccountInput = {
  address: string;
  password: string;
};

/**
 * Soft-fail login /me resolve outcome.
 * Never includes token/password in warnMessage.
 */
export type ResolveMailTmAccountResult =
  | {
      ok: true;
      accountId: string;
      token: string;
    }
  | {
      ok: false;
      warnMessage: string;
    };
