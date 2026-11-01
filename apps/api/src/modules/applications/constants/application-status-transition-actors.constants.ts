import type { ApplicationStatusTransitionActor } from '@vises/contracts';
import { VISA_CENTER_MONITOR_ACTOR } from './visa-center-monitor.constants';

/**
 * Runtime allow-list for history `actorRole` narrowing (FR-7 / T14.2).
 * Matches ApplicationStatusTransitionActor (staff + visa_center_monitor).
 */
export const APPLICATION_STATUS_TRANSITION_ACTORS = [
  'superadmin',
  'admin',
  'agent',
  VISA_CENTER_MONITOR_ACTOR,
] as const satisfies readonly ApplicationStatusTransitionActor[];
