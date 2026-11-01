import type { ApplicationStatusHistoryDto } from '@vises/contracts';
import { formatIso } from '../../../shared/utils';
import type { ApplicationStatusHistory } from '../../database/entities/application-status-history.entity';
import { narrowHistoryActorRole } from './narrow-history-actor-role.util';

/**
 * Map history entity → wire DTO (T14.2 / T15.4).
 * Omits `reason` (entity has no reason column — never invent).
 * Unrecognized `actorRole` values become `"unknown"` (never 500).
 * No plaintext PII fields.
 */
export const mapStatusHistoryToDto = (
  row: ApplicationStatusHistory,
): ApplicationStatusHistoryDto => {
  return {
    id: row.id,
    fromStatus: row.fromStatus,
    toStatus: row.toStatus,
    actorId: row.actorId,
    actorRole: narrowHistoryActorRole(row.actorRole),
    trigger: row.trigger,
    createdAt: formatIso(row.createdAt),
  };
};
