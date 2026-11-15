import type { PortalStatusCheckpoint } from '../types/portal-status-checkpoint.types';
import { isPortalStatusCheckpointStep } from './is-portal-status-checkpoint-step.util';
import { isPortalStatusMemberBranch } from './is-portal-status-member-branch.util';
import { parsePortalStatusFieldProgress } from './parse-portal-status-field-progress.util';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Parse durable checkpoint jsonb. Returns null when structure is unusable.
 * Strips anything except the approved id/status keys (CON-003).
 */
export const parsePortalStatusCheckpoint = (
  raw: Record<string, unknown> | null | undefined,
): PortalStatusCheckpoint | null => {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  if (!isNonEmptyString(raw.applicantId)) {
    return null;
  }

  if (
    !isNonEmptyString(raw.lastCompletedStep) ||
    !isPortalStatusCheckpointStep(raw.lastCompletedStep)
  ) {
    return null;
  }

  const checkpoint: PortalStatusCheckpoint = {
    lastCompletedStep: raw.lastCompletedStep,
    applicantId: raw.applicantId.trim(),
    fieldProgress: parsePortalStatusFieldProgress(raw.fieldProgress),
  };

  if (isNonEmptyString(raw.locationId)) {
    checkpoint.locationId = raw.locationId.trim();
  }
  if (isNonEmptyString(raw.visaTypeId)) {
    checkpoint.visaTypeId = raw.visaTypeId.trim();
  }
  if (
    isNonEmptyString(raw.memberBranch) &&
    isPortalStatusMemberBranch(raw.memberBranch)
  ) {
    checkpoint.memberBranch = raw.memberBranch;
  }

  return checkpoint;
};
