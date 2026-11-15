import { PORTAL_STATUS_CHECKPOINT_STEP } from '../constants/portal-status-checkpoint-step.constants';
import type { PortalStatusCheckpoint } from '../types/portal-status-checkpoint.types';
import { createEmptyPortalStatusFieldProgress } from './create-empty-portal-status-field-progress.util';

/** Seed checkpoint for a STATUS_APPLICANT task before first scrape. */
export const createInitialPortalStatusCheckpoint = (input: {
  applicantId: string;
}): PortalStatusCheckpoint => ({
  lastCompletedStep: PORTAL_STATUS_CHECKPOINT_STEP.AUTHENTICATED,
  applicantId: input.applicantId,
  fieldProgress: createEmptyPortalStatusFieldProgress(),
});
