import { Logger } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { BlsWorkflowTask } from '../../database/entities/bls-workflow-task.entity';
import type { SavePortalStatusCheckpointInput } from '../types/portal-status-checkpoint.types';
import { formatPortalStatusCheckpointLogSummary } from './format-portal-status-checkpoint-log-summary.util';
import { serializePortalStatusCheckpoint } from './serialize-portal-status-checkpoint.util';

const logger = new Logger('savePortalStatusCheckpoint');

/**
 * Persist portal_status + portal_checkpoint_json without logging field values
 * (REQ-015 / REQ-016 / CON-003 / NFR-002).
 */
export const savePortalStatusCheckpoint = async (
  taskRepo: Repository<BlsWorkflowTask>,
  input: SavePortalStatusCheckpointInput,
): Promise<void> => {
  const portalCheckpointJson = serializePortalStatusCheckpoint(
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
    `saved taskId=${input.taskId} portalStatus=${input.portalStatus ?? 'unchanged'} ${formatPortalStatusCheckpointLogSummary(input.checkpoint)}`,
  );
};
