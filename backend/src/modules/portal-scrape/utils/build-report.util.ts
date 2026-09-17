import type {
  AutofillReport,
  MappingResult,
  ReportFieldRow,
} from '../types';
import { maskSensitiveValue } from './mask-sensitive-value.util';

export const buildReport = (mapping: MappingResult): AutofillReport => {
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
};
