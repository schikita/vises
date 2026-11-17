import type { ApplicationStatusTransitionActor } from '@vises/contracts';
import { VISA_CENTER_MONITOR_ACTOR } from './visa-center-monitor.constants';

/**
 * Runtime allow-list for history `actorRole` narrowing (FR-13 / §4.C / T14.2).
 * Matches ApplicationStatusTransitionActor (staff + system + visa_center_monitor).
 */
export const APPLICATION_STATUS_TRANSITION_ACTORS = [
  'superadmin',
  'admin',
  'agent',
  'system',
  VISA_CENTER_MONITOR_ACTOR,
] as const satisfies readonly ApplicationStatusTransitionActor[];
