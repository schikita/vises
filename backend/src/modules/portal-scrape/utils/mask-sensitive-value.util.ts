import { SENSITIVE_FIELDS } from '../constants';
import type { PortalFieldName } from '../types';

/** Mask passport / OTP-like values for shared logs (NFR-005). */
export const maskSensitiveValue = (
  field: PortalFieldName,
  value: string | undefined,
): string | undefined => {
  if (value === undefined) return undefined;
  if (!SENSITIVE_FIELDS.has(field)) return value;
  if (field === 'EmailOtp') return value.length > 0 ? '***' : value;
  if (value.length <= 4) return '****';
  return `${'*'.repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`;
};
