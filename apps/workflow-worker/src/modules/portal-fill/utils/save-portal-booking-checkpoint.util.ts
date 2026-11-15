import { Logger } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { BlsWorkflowTask } from '../../database/entities/bls-workflow-task.entity';
import type { SavePortalBookingCheckpointInput } from '../types/portal-booking-checkpoint.types';
import { formatPortalBookingCheckpointLogSummary } from './format-portal-booking-checkpoint-log-summary.util';
import { serializePortalBookingCheckpoint } from './serialize-portal-booking-checkpoint.util';

const logger = new Logger('savePortalBookingCheckpoint');

/**
 * Persist BOOK `portal_checkpoint_json` (Option A columns) without logging
 * field values, email HTML, or consent tokens (REQ-006 / REQ-018 / NFR-002).
 */
export const savePortalBookingCheckpoint = async (
  taskRepo: Repository<BlsWorkflowTask>,
  input: SavePortalBookingCheckpointInput,
): Promise<void> => {
  const portalCheckpointJson = serializePortalBookingCheckpoint(
    input.checkpoint,
  );

  // TypeORM QueryDeepPartialEntity rejects Record<string, unknown> jsonb writes.
  await taskRepo.update(
    { id: input.taskId },
    {
      ...(input.portalStatus !== undefined
        ? { portalStatus: input.portalStatus }
        : {}),
      portalCheckpointJson: portalCheckpointJson as never,
    },
  );

  logger.log(
    `saved taskId=${input.taskId} portalStatus=${input.portalStatus ?? 'unchanged'} ${formatPortalBookingCheckpointLogSummary(input.checkpoint)}`,
  );
};
