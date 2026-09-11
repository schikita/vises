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

/** Fields the fill module must never write (REQ-008, DEC-007). */
export const NEVER_FILL = new Set<PortalFieldName>(['CountryCode', 'EmailOtp']);
