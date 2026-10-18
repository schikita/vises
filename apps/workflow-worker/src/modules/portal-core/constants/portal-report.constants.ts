import type { PortalFieldName } from '../types/portal-field.types';

export const SENSITIVE_FIELDS = new Set<PortalFieldName>([
  'PassportNumber',
  'EmailOtp',
]);
