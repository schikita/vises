import type { MappingResult, PortalFieldName } from '../types';

/**
 * Intentional non-fill / deferred targets — may stay skipped without blocking ok.
 * Email: skipped at map when OTP path defers post-captcha Mail.tm fill (DEC-001).
 * Unarmed path still maps Email as filled|failed (never skipped).
 */
const OPTIONAL_OR_OUT_OF_SCOPE = new Set<PortalFieldName>([
  'CountryCode',
  'Email',
  'EmailOtp',
]);

/**
 * Report `ok: true` only when every required field is filled and nothing failed.
 * CountryCode / Email / EmailOtp may be skipped (default / deferred post-captcha fill).
 */
export const mappingOk = (fields: MappingResult['fields']): boolean =>
  fields.every((f) => {
    if (OPTIONAL_OR_OUT_OF_SCOPE.has(f.field)) {
      return f.status === 'skipped' || f.status === 'filled';
    }
    return f.status === 'filled';
  });
