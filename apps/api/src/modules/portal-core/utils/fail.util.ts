import type { FieldResult, PortalFieldName } from '../types';

export const fail = (
  field: PortalFieldName,
  reason: string,
  extra?: Partial<FieldResult>,
): FieldResult => ({ field, status: 'failed', reason, ...extra });
