import type { ApplicationStatus } from '@vises/contracts';
import {
  SEED_MONITOR_ACTOR_ROLE,
  SEED_MONITOR_TRIGGER,
  SEED_STAFF_STATUS_TRIGGER,
} from '../constants';
import type { SeedStatusTransition } from '../types';

/**
 * History steps that reach `finalStatus` via §4.C / FR-13 (REQ-005).
 * `draft` / `filling` → empty (create-like; no history rows).
 * Chains are BUSINESS-only — no drafting→pending or booked→issued.
 */
export const buildStatusHistoryChain = (
  finalStatus: ApplicationStatus,
  agentId: string,
): SeedStatusTransition[] => {
  if (finalStatus === 'draft' || finalStatus === 'filling') {
    return [];
  }

  const monitorEdge: SeedStatusTransition = {
    fromStatus: 'draft',
    toStatus: 'not_ready_for_appointment',
    actorId: null,
    actorRole: SEED_MONITOR_ACTOR_ROLE,
    trigger: SEED_MONITOR_TRIGGER,
    dayOffset: 1,
  };

  if (finalStatus === 'not_ready_for_appointment') {
    return [monitorEdge];
  }

  if (finalStatus === 'declined') {
    return [
      monitorEdge,
      {
        fromStatus: 'not_ready_for_appointment',
        toStatus: 'declined',
        actorId: agentId,
        actorRole: 'agent',
        trigger: SEED_STAFF_STATUS_TRIGGER,
        dayOffset: 3,
      },
    ];
  }

  if (finalStatus === 'ready_for_appointment') {
    return [
      monitorEdge,
      {
        fromStatus: 'not_ready_for_appointment',
        toStatus: 'ready_for_appointment',
        actorId: agentId,
        actorRole: 'agent',
        trigger: SEED_STAFF_STATUS_TRIGGER,
        dayOffset: 3,
      },
    ];
  }

  if (finalStatus === 'booked') {
    return [
      monitorEdge,
      {
        fromStatus: 'not_ready_for_appointment',
        toStatus: 'ready_for_appointment',
        actorId: agentId,
        actorRole: 'agent',
        trigger: SEED_STAFF_STATUS_TRIGGER,
        dayOffset: 3,
      },
      {
        fromStatus: 'ready_for_appointment',
        toStatus: 'booked',
        actorId: agentId,
        actorRole: 'agent',
        trigger: SEED_STAFF_STATUS_TRIGGER,
        dayOffset: 5,
      },
    ];
  }

  return [];
};
