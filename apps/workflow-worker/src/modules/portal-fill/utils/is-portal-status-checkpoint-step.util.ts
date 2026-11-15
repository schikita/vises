import { PORTAL_STATUS_CHECKPOINT_STEP } from '../constants/portal-status-checkpoint-step.constants';
import type { PortalStatusCheckpointStep } from '../types/portal-status-checkpoint.types';

const STEP_VALUES = new Set<string>(
  Object.values(PORTAL_STATUS_CHECKPOINT_STEP),
);

export const isPortalStatusCheckpointStep = (
  value: string,
): value is PortalStatusCheckpointStep => STEP_VALUES.has(value);
