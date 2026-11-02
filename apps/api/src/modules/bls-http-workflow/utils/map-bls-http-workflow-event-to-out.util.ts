import type { BlsHttpWorkflowEvent } from '../../database/entities/bls-http-workflow-event.entity';
import type { BlsHttpWorkflowEventOut } from '../types/bls-http-workflow-api.types';

/**
 * Map persist row → poll DTO. bigint id → number (safe for poll cursors).
 */
export const mapBlsHttpWorkflowEventToOut = (
  row: BlsHttpWorkflowEvent,
): BlsHttpWorkflowEventOut => ({
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
