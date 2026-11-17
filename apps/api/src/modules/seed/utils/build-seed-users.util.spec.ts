import type { User } from '../../database/entities/user.entity';
import {
  SEED_ADMIN_PASSWORD,
  SEED_AGENT_COUNT,
  SEED_AGENT_PASSWORD,
  SEED_SUPERADMIN_LOGIN,
  SEED_SUPERADMIN_PASSWORD,
  SEED_SUPERADMIN_USER_ID,
} from '../constants';
import { buildSeedUsers } from './build-seed-users.util';
import { formatSeedMoney } from './format-seed-money.util';

describe('buildSeedUsers (FR-11)', (): void => {
  const create = (data: Partial<User>): User => data as User;

  it('creates 1 superadmin, 2 admins, 20 agents with plan-matched balances', (): void => {
    const result = buildSeedUsers(
      { create },
      new Date('2026-03-01T00:00:00.000Z'),
    );

    expect(result.users).toHaveLength(3 + SEED_AGENT_COUNT);
    expect(result.agentPlans).toHaveLength(SEED_AGENT_COUNT);
    expect(result.superadminId).toBe(SEED_SUPERADMIN_USER_ID);

    const roleCounts = result.users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    expect(roleCounts).toEqual({
      superadmin: 1,
      admin: 2,
      agent: SEED_AGENT_COUNT,
    });

    expect(
      result.users.find((u) => u.role === 'superadmin')?.login,
    ).toBe(SEED_SUPERADMIN_LOGIN);
    expect(
      result.users.find((u) => u.role === 'superadmin')?.invitePassword,
    ).toBe(SEED_SUPERADMIN_PASSWORD);
    expect(
      result.users
        .filter((u) => u.role === 'admin')
        .every((u) => u.invitePassword === SEED_ADMIN_PASSWORD),
    ).toBe(true);

    for (const plan of result.agentPlans) {
      const agent = result.users.find((u) => u.id === plan.userId);
      expect(agent?.role).toBe('agent');
      expect(agent?.login).toBe(plan.login);
      expect(agent?.inviteToken).toBe(plan.inviteToken);
      expect(agent?.invitePassword).toBe(SEED_AGENT_PASSWORD);
      expect(agent?.balance).toBe(formatSeedMoney(plan.finalBalanceWhole, 1));
      expect(agent?.id).toMatch(/^u-agent-\d{2}$/);
      expect(agent?.login).toMatch(/^agent-\d{2}@vises\.app$/);
    }

    expect(result.users.some((u) => u.id === 'u-agent-a')).toBe(false);
    expect(result.users.some((u) => u.id === 'u-agent-b')).toBe(false);

    const createdAts = result.users.map((u) => u.createdAt?.toISOString());
    expect(new Set(createdAts).size).toBe(result.users.length);
  });
});
