import type { BlsWorkflowEvent } from '../../database/entities/bls-workflow-event.entity';
import type { BlsWorkflowEventOut } from '../types/bls-workflow-api.types';

/**
 * Map persist row → poll DTO. bigint id → number (safe for poll cursors).
 */
export const mapBlsWorkflowEventToOut = (
  row: BlsWorkflowEvent,
): BlsWorkflowEventOut => ({
  id: Number(row.id),
  eventType: row.eventType,
  stepKey: row.stepKey,
  taskKey: row.taskKey,
  payloadSafe:
    row.payloadSafe && typeof row.payloadSafe === 'object'
      ? row.payloadSafe
      : {},
  createdAt: row.createdAt.toISOString(),
});
