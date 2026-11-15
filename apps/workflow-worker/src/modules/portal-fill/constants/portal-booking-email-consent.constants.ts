/** BOOK email DP consent failure codes (SAFE_TO_REPEAT). */
export const PORTAL_BOOKING_EMAIL_CONSENT_ERROR_CODE = {
  MAILBOX: 'bls_booking_email_consent_mailbox',
  MESSAGE: 'bls_booking_email_consent_message',
  HREF: 'bls_booking_email_consent_href',
  OPEN: 'bls_booking_email_consent_open',
  ABORTED: 'bls_booking_email_consent_aborted',
} as const;

export type PortalBookingEmailConsentErrorCode =
  (typeof PORTAL_BOOKING_EMAIL_CONSENT_ERROR_CODE)[keyof typeof PORTAL_BOOKING_EMAIL_CONSENT_ERROR_CODE];

/**
 * Fixed open_link failure phase code (NFR-002).
 * Never substitute Patchright/Playwright `err.message` (may embed consent URL/`data=`).
 */
export const PORTAL_BOOKING_EMAIL_CONSENT_OPEN_LINK_FAILED = 'open_link_failed';
