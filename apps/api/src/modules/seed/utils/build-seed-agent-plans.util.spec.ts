import { APPLICATION_STATUSES } from '@vises/contracts';
import {
  SEED_AGENT_COUNT,
  SEED_CLIENTS_PER_AGENT_MAX,
  SEED_CLIENTS_PER_AGENT_MIN,
  SEED_DEFAULT_PRICE,
  SEED_EXTRA_BALANCE_SLOTS_MAX,
} from '../constants';
import { buildSeedAgentPlans } from './build-seed-agent-plans.util';

const BUSINESS_STATUS_SET = new Set<string>(APPLICATION_STATUSES);
const FR7_FORBIDDEN = new Set([
  'drafting',
  'pending',
  'rejected',
  'issued',
]);

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
      expect(plan.userId).not.toMatch(/u-agent-[ab]$/);
      expect(plan.login).not.toMatch(/agent-[ab]@vises\.app/);

      for (const status of plan.statuses) {
        expect(BUSINESS_STATUS_SET.has(status)).toBe(true);
        expect(FR7_FORBIDDEN.has(status)).toBe(false);
      }
    }

    expect(first.map((plan) => plan.ordinal)).toEqual(
      Array.from({ length: SEED_AGENT_COUNT }, (_, i) =>
        String(i + 1).padStart(2, '0'),
      ),
    );
  });
});
