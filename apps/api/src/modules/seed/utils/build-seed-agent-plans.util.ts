import type { ApplicationStatus } from '@vises/contracts';
import {
  SEED_AGENT_COUNT,
  SEED_AGENT_ID_PREFIX,
  SEED_AGENT_INVITE_TOKEN_PREFIX,
  SEED_AGENT_LOGIN_DOMAIN,
  SEED_AGENT_LOGIN_LOCAL_PREFIX,
  SEED_AGENT_NAME_PREFIX,
  SEED_APPLICATION_STATUS_POOL,
  SEED_CLIENTS_PER_AGENT_MAX,
  SEED_CLIENTS_PER_AGENT_MIN,
  SEED_DEFAULT_PRICE,
  SEED_EXTRA_BALANCE_SLOTS_MAX,
  SEED_RNG_SEED,
} from '../constants';
import type { SeedAgentPlan } from '../types';
import { createSeedRng } from './create-seed-rng.util';
import { formatSeedAgentOrdinal } from './format-seed-agent-ordinal.util';
import { pickSeedInt } from './pick-seed-int.util';
import { pickSeedItem } from './pick-seed-item.util';

/**
 * Build the deterministic 20-agent FR-11 plan: client counts in [2, 50],
 * random statuses over the BUSINESS six-value union, and balance slots =
 * client_count + random(0..5).
 */
export const buildSeedAgentPlans = (): SeedAgentPlan[] => {
  const rng = createSeedRng(SEED_RNG_SEED);
  const plans: SeedAgentPlan[] = [];

  for (let index = 1; index <= SEED_AGENT_COUNT; index += 1) {
    const ordinal = formatSeedAgentOrdinal(index);
    const clientCount = pickSeedInt(
      SEED_CLIENTS_PER_AGENT_MIN,
      SEED_CLIENTS_PER_AGENT_MAX,
      rng,
    );
    const extraSlots = pickSeedInt(0, SEED_EXTRA_BALANCE_SLOTS_MAX, rng);
    const balanceSlots = clientCount + extraSlots;
    const statuses: ApplicationStatus[] = Array.from(
      { length: clientCount },
      (): ApplicationStatus => pickSeedItem(SEED_APPLICATION_STATUS_POOL, rng),
    );

    plans.push({
      index,
      ordinal,
      userId: `${SEED_AGENT_ID_PREFIX}${ordinal}`,
      name: `${SEED_AGENT_NAME_PREFIX}${ordinal}`,
      login: `${SEED_AGENT_LOGIN_LOCAL_PREFIX}${ordinal}@${SEED_AGENT_LOGIN_DOMAIN}`,
      inviteToken: `${SEED_AGENT_INVITE_TOKEN_PREFIX}${ordinal}`,
      clientCount,
      extraSlots,
      balanceSlots,
      topUpAmountWhole: balanceSlots * SEED_DEFAULT_PRICE,
      finalBalanceWhole: extraSlots * SEED_DEFAULT_PRICE,
      statuses,
      rngSeedOffset: index * 97,
    });
  }

  return plans;
};
