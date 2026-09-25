import type { FieldResult, PortalFieldName } from '../types';

export const filled = (
  field: PortalFieldName,
  value: string,
  extra?: Partial<FieldResult>,
): FieldResult => ({ field, status: 'filled', value, ...extra });
