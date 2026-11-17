import type {
  AnalyticsAppOwnerRawRow,
  AnalyticsAppOwnerRow,
} from '../types';

const coercePaymentPaid = (value: unknown): boolean => {
  if (value === true || value === 1 || value === '1') {
    return true;
  }
  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    return lowered === 't' || lowered === 'true';
  }
  return false;
};

const coercePaymentAmount = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const coerceString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

const coerceCreatedAt = (value: unknown): Date => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date(0);
};

/**
 * Map raw owner query row to a typed analytics owner row (ASAU-TASK-002).
 */
export const mapAppOwnerRow = (
  row: AnalyticsAppOwnerRawRow,
): AnalyticsAppOwnerRow => ({
  applicationId: coerceString(row.applicationId),
  agentId: coerceString(row.agentId),
  paymentPaid: coercePaymentPaid(row.paymentPaid),
  paymentAmount: coercePaymentAmount(row.paymentAmount),
  submitCity: coerceString(row.submitCity),
  visitDate: coerceString(row.visitDate),
  createdAt: coerceCreatedAt(row.createdAt),
});
