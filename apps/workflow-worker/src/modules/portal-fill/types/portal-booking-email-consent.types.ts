import type { TemporaryEmailProvider } from '../../temporary-email';
import type { PortalBookingCheckpointCallbacks } from './portal-booking-checkpoint.types';
import type { PortalPage } from './patchright-surface.types';

/**
 * Retained mailbox handle for BOOK data-protection consent (REQ-002 / CON-001).
 * Token may be empty for browser-mail; restoreAddress is portalFormEmail.
 */
export type PortalBookingEmailConsentMailbox = {
  contextKey: string;
  /** Vaulted MAILBOX_TOKEN when present; empty for browser-mail (DEC-006). */
  token: string;
  /** Retained portal form email address to reopen inbox. */
  restoreAddress: string;
};

export type CompletePortalBookingEmailConsentOptions = {
  page: PortalPage;
  mailProvider: Pick<
    TemporaryEmailProvider,
    | 'createAccount'
    | 'waitLatestMessage'
    | 'extractDataProtectionConsentHref'
    | 'disposeSession'
  >;
  mailbox: PortalBookingEmailConsentMailbox;
  /** Skip wait/open when checkpoint already records consent (OQ-001). */
  alreadyConsented: boolean;
  onCheckpoint?: PortalBookingCheckpointCallbacks['onCheckpoint'];
  logPrefix?: string;
  abortSignal?: AbortSignal;
  /** Override wait budget; defaults to TEMPORARY_EMAIL_WAIT_FOR_EMAIL_MS. */
  timeoutMs?: number;
};

export type CompletePortalBookingEmailConsentResult =
  | {
      ok: true;
      skipped: boolean;
      messageId?: string;
      notes: string[];
    }
  | {
      ok: false;
      error: string;
      errorCode?: string;
      notes: string[];
    };
