import type { Repository } from 'typeorm';
import { BlsWorkflowTask } from '../../database/entities/bls-workflow-task.entity';
import { BLS_APPLICANT_PORTAL_STATUS } from '../constants/bls-applicant-portal-status.constants';
import type { BlsApplicantPortalStatus } from '../types/bls-applicant-portal-status.types';
import type { LoadPortalStatusCheckpointResult } from '../types/portal-status-checkpoint.types';
import { parsePortalStatusCheckpoint } from './parse-portal-status-checkpoint.util';

const PORTAL_STATUS_VALUES = new Set<string>(
  Object.values(BLS_APPLICANT_PORTAL_STATUS),
);

const parsePortalStatus = (
  value: string | null,
): BlsApplicantPortalStatus | null => {
  if (value == null || value.trim().length === 0) {
    return null;
  }
  const trimmed = value.trim();
  if (!PORTAL_STATUS_VALUES.has(trimmed)) {
    return BLS_APPLICANT_PORTAL_STATUS.UNKNOWN;
  }
  return trimmed as BlsApplicantPortalStatus;
};

/**
 * Load prior portal_status + portal_checkpoint_json for a STATUS task.
 * Null checkpoint means resume-from-scrape (REQ-017 entry).
 */
export const loadPortalStatusCheckpoint = async (
  taskRepo: Repository<BlsWorkflowTask>,
  taskId: string,
): Promise<LoadPortalStatusCheckpointResult> => {
  const row = await taskRepo.findOne({ where: { id: taskId } });
  if (!row) {
    return { portalStatus: null, checkpoint: null };
  }

  return {
    portalStatus: parsePortalStatus(row.portalStatus),
    checkpoint: parsePortalStatusCheckpoint(row.portalCheckpointJson),
  };
};
