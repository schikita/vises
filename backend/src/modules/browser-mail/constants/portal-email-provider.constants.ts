/**
 * Portal temporary-email provider env values (DEC-001).
 * Matches VISES_PORTAL_EMAIL_PROVIDER in app-env.schema.
 */

export const PORTAL_EMAIL_PROVIDER = {
  MAILTM: 'mailtm',
  TEMPMAIL_PLUS: 'tempmail_plus',
} as const;

export type PortalEmailProviderValue =
  (typeof PORTAL_EMAIL_PROVIDER)[keyof typeof PORTAL_EMAIL_PROVIDER];
