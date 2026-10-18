import type { FieldResult, PortalFieldName } from '../types';

export const skipped = (
  field: PortalFieldName,
  reason: string,
  extra?: Partial<FieldResult>,
): FieldResult => ({ field, status: 'skipped', reason, ...extra });
