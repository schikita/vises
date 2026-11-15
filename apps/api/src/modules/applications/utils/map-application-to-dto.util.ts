import type { ApplicationDto } from '@vises/contracts';
import { formatIso } from '../../../shared/utils';
import type { Application } from '../../database/entities/application.entity';

/** Map Application entity → frozen ApplicationDto (T1 / §6.6 / REQ-003). */
export const mapApplicationToDto = (row: Application): ApplicationDto => {
  return {
    id: row.id,
    clientId: row.clientId,
    status: row.status,
    visaSubType: row.visaSubType ?? null,
    createdAt: formatIso(row.createdAt),
    updatedAt: formatIso(row.updatedAt),
  };
};
