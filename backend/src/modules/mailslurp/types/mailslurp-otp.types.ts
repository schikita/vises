/**
 * MailSlurp disposable inbox + OTP extract shapes (DEC-003 / DEC-004 / DEC-005).
 */

export type MailSlurpInboxHandle = {
  id: string;
  emailAddress: string;
};

export type CreateMailSlurpInboxInput = {
  apiKey: string;
};

export type WaitMailSlurpLatestEmailInput = {
  apiKey: string;
  inboxId: string;
  /** Max wait ms (DEC-010 / NFR-001). */
  timeoutMs: number;
  /** Default true when omitted by caller (unreadOnly wait). */
  unreadOnly?: boolean;
};

export type WaitMailSlurpLatestEmailResult = {
  emailId: string;
  /**
   * Hydrated body text when present. Callers must not log this (NFR-004);
   * pass only into OTP extract.
   */
  body: string;
};

export type ExtractMailSlurpOtpInput = {
  apiKey: string;
  emailId: string;
  /** Optional body for local cue/fallback when content-match is empty. */
  body?: string;
};

export type ExtractMailSlurpOtpResult =
  | {
      ok: true;
      otp: string;
      source: 'content-match' | 'body-fallback';
    }
  | {
      ok: false;
      reason: string;
    };

export type DeleteMailSlurpInboxInput = {
  apiKey: string;
  inboxId: string;
};

/** Best-effort delete outcome (DEC-005). Never throws to caller. */
export type DeleteMailSlurpInboxResult = {
  deleted: boolean;
  /** Soft-fail detail; never includes API key. */
  warnMessage?: string;
};
