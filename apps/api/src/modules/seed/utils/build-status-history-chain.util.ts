import type { ApplicationStatus } from '@vises/contracts';
import {
  SEED_MONITOR_ACTOR_ROLE,
  SEED_MONITOR_TRIGGER,
  SEED_STAFF_STATUS_TRIGGER,
} from '../constants';
import type { SeedStatusTransition } from '../types';

/**
 * History steps that reach `finalStatus` via the FR-7.4 matrix.
 * Drafting → empty (create leaves no history; analytics defaults to drafting).
 * Includes drafting→pending and booked→issued whenever those apply (AC-16).
 */
export const buildStatusHistoryChain = (
  finalStatus: ApplicationStatus,
  agentId: string,
): SeedStatusTransition[] => {
  if (finalStatus === 'drafting') {
    return [];
  }

  const chain: SeedStatusTransition[] = [
    {
      fromStatus: 'drafting',
      toStatus: 'pending',
      actorId: null,
      actorRole: SEED_MONITOR_ACTOR_ROLE,
      trigger: SEED_MONITOR_TRIGGER,
      dayOffset: 1,
    },
  ];

  if (finalStatus === 'pending') {
    return chain;
  }

  if (finalStatus === 'rejected') {
    chain.push({
      fromStatus: 'pending',
      toStatus: 'rejected',
      actorId: agentId,
      actorRole: 'agent',
      trigger: SEED_STAFF_STATUS_TRIGGER,
      dayOffset: 3,
    });
    return chain;
  }

  chain.push({
    fromStatus: 'pending',
    toStatus: 'booked',
    actorId: agentId,
    actorRole: 'agent',
    trigger: SEED_STAFF_STATUS_TRIGGER,
    dayOffset: 3,
  });

  if (finalStatus === 'booked') {
    return chain;
  }

  chain.push({
    fromStatus: 'booked',
    toStatus: 'issued',
    actorId: agentId,
    actorRole: 'agent',
    trigger: SEED_STAFF_STATUS_TRIGGER,
    dayOffset: 5,
  });
  return chain;
};
