import type { PortalFieldName } from '../../portal-core/types/portal-field.types';

export const DATE_FIELDS = new Set<PortalFieldName>([
  'DateOfBirth',
  'PassportIssueDate',
  'PassportExpiryDate',
]);

export const DROPDOWN_FIELDS = new Set<PortalFieldName>([
  'PassportType',
  'BirthCountry',
]);

export const TEXT_FIELDS = new Set<PortalFieldName>([
  'SurName',
  'FirstName',
  'LastName',
  'PassportNumber',
  'IssuePlace',
  'Mobile',
  'Email',
]);

/**
 * Fields the CRM fill loop must never write.
 * CountryCode: leave form default (REQ-008).
 * EmailOtp: skipped at CRM fill; when email OTP path is armed, the
 * post-captcha phase fills it intentionally (DEC-007 / REQ-009).
 */
export const NEVER_FILL = new Set<PortalFieldName>(['CountryCode', 'EmailOtp']);
