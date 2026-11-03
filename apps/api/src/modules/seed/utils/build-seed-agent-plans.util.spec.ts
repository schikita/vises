import {
  SEED_AGENT_COUNT,
  SEED_CLIENTS_PER_AGENT_MAX,
  SEED_CLIENTS_PER_AGENT_MIN,
  SEED_DEFAULT_PRICE,
  SEED_EXTRA_BALANCE_SLOTS_MAX,
} from '../constants';
import { buildSeedAgentPlans } from './build-seed-agent-plans.util';

describe('buildSeedAgentPlans (FR-11 / AC-19)', (): void => {
  it('builds exactly 20 deterministic agent plans with valid volume bounds', (): void => {
    const first = buildSeedAgentPlans();
    const second = buildSeedAgentPlans();

    expect(first).toHaveLength(SEED_AGENT_COUNT);
    expect(second).toEqual(first);

    for (const plan of first) {
      expect(plan.clientCount).toBeGreaterThanOrEqual(SEED_CLIENTS_PER_AGENT_MIN);
      expect(plan.clientCount).toBeLessThanOrEqual(SEED_CLIENTS_PER_AGENT_MAX);
      expect(plan.extraSlots).toBeGreaterThanOrEqual(0);
      expect(plan.extraSlots).toBeLessThanOrEqual(SEED_EXTRA_BALANCE_SLOTS_MAX);
      expect(plan.statuses).toHaveLength(plan.clientCount);
      expect(plan.balanceSlots).toBe(plan.clientCount + plan.extraSlots);
      expect(plan.topUpAmountWhole).toBe(plan.balanceSlots * SEED_DEFAULT_PRICE);
      expect(plan.finalBalanceWhole).toBe(plan.extraSlots * SEED_DEFAULT_PRICE);
      expect(plan.userId).toBe(`u-agent-${plan.ordinal}`);
      expect(plan.login).toBe(`agent-${plan.ordinal}@vises.app`);
    }
  });
});
