import type { PortalFieldName } from '../types';

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
 * EmailOtp: skipped at CRM fill; when MailSlurp OTP path is armed, the
 * post-CapMonster phase fills it intentionally (DEC-009 / REQ-016).
 */
export const NEVER_FILL = new Set<PortalFieldName>(['CountryCode', 'EmailOtp']);
