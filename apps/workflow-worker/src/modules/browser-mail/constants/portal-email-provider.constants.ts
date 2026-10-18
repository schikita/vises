/**
 * Portal temporary-email provider (tempmail_plus only).
 */

export const PORTAL_EMAIL_PROVIDER = {
  TEMPMAIL_PLUS: 'tempmail_plus',
} as const;

export type PortalEmailProviderValue =
  (typeof PORTAL_EMAIL_PROVIDER)[keyof typeof PORTAL_EMAIL_PROVIDER];
