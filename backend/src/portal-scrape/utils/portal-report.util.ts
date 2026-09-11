import { SENSITIVE_FIELDS } from '../constants';
import type {
  AutofillReport,
  MappingResult,
  PortalFieldName,
  ReportFieldRow,
} from '../types';

/** Mask passport / OTP-like values for shared logs (NFR-005). */
export function maskSensitiveValue(
  field: PortalFieldName,
  value: string | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  if (!SENSITIVE_FIELDS.has(field)) return value;
  if (field === 'EmailOtp') return value.length > 0 ? '***' : value;
  if (value.length <= 4) return '****';
  return `${'*'.repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`;
}

export function buildReport(mapping: MappingResult): AutofillReport {
  const fields: ReportFieldRow[] = mapping.fields.map((f) => ({
    field: f.field,
    status: f.status,
    value: maskSensitiveValue(f.field, f.value),
    reason: f.reason,
    provisional: f.provisional,
  }));

  const summary = {
    filled: fields.filter((f) => f.status === 'filled').length,
    skipped: fields.filter((f) => f.status === 'skipped').length,
    failed: fields.filter((f) => f.status === 'failed').length,
  };

  return {
    ok: mapping.ok,
    applicationId: mapping.applicationId,
    applicantId: mapping.applicantId,
    summary,
    fields,
    metadata: mapping.metadata,
    generatedAt: new Date().toISOString(),
  };
}
