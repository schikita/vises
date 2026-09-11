import type { PortalFieldName } from '../types';

export const SENSITIVE_FIELDS = new Set<PortalFieldName>([
  'PassportNumber',
  'EmailOtp',
]);
