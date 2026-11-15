import type { Repository } from 'typeorm';
import { BlsWorkflowTask } from '../../database/entities/bls-workflow-task.entity';
import type { LoadPortalBookingCheckpointResult } from '../types/portal-booking-checkpoint.types';
import { parsePortalBookingCheckpoint } from './parse-portal-booking-checkpoint.util';

/**
 * Load prior `portal_checkpoint_json` for a BOOK task.
 * Null checkpoint means resume-from-scratch (02-database.md / REQ-018).
 */
export const loadPortalBookingCheckpoint = async (
  taskRepo: Repository<BlsWorkflowTask>,
  taskId: string,
): Promise<LoadPortalBookingCheckpointResult> => {
  const row = await taskRepo.findOne({ where: { id: taskId } });
  if (!row) {
    return { checkpoint: null };
  }

  return {
    checkpoint: parsePortalBookingCheckpoint(row.portalCheckpointJson),
  };
};
