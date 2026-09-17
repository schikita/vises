import type { MappingResult, PortalFieldName } from '../types';

/** Intentional non-fill targets — may stay skipped without blocking ok. */
const OPTIONAL_OR_OUT_OF_SCOPE = new Set<PortalFieldName>([
  'CountryCode',
  'EmailOtp',
]);

/**
 * Report `ok: true` only when every required field is filled and nothing failed.
 * CountryCode / EmailOtp may be skipped (leave default / OTP filled later).
 */
export const mappingOk = (fields: MappingResult['fields']): boolean =>
  fields.every((f) => {
    if (OPTIONAL_OR_OUT_OF_SCOPE.has(f.field)) {
      return f.status === 'skipped' || f.status === 'filled';
    }
    return f.status === 'filled';
  });
