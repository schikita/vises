import type {
  PortalStatusFieldProgress,
  PortalStatusFieldProgressFailedEntry,
} from '../types/portal-status-checkpoint.types';
import { createEmptyPortalStatusFieldProgress } from './create-empty-portal-status-field-progress.util';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const parseFailedEntry = (
  value: unknown,
): PortalStatusFieldProgressFailedEntry | null => {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (!isNonEmptyString(record.fieldId) || !isNonEmptyString(record.reasonCode)) {
    return null;
  }
  return {
    fieldId: record.fieldId.trim(),
    reasonCode: record.reasonCode.trim().slice(0, 64),
  };
};

/**
 * Parse fieldProgress from jsonb — ids + reason codes only.
 * Drops unknown shapes; never keeps value-like keys.
 */
export const parsePortalStatusFieldProgress = (
  raw: unknown,
): PortalStatusFieldProgress => {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return createEmptyPortalStatusFieldProgress();
  }
  const record = raw as Record<string, unknown>;
  const filled = Array.isArray(record.filled)
    ? record.filled.filter(isNonEmptyString).map((id) => id.trim())
    : [];
  const skipped = Array.isArray(record.skipped)
    ? record.skipped.filter(isNonEmptyString).map((id) => id.trim())
    : [];
  const failed = Array.isArray(record.failed)
    ? record.failed
        .map(parseFailedEntry)
        .filter((entry): entry is PortalStatusFieldProgressFailedEntry => entry != null)
    : [];
  return { filled, skipped, failed };
};
