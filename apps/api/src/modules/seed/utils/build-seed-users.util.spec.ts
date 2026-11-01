import type { User } from '../../database/entities/user.entity';
import {
  SEED_ADMIN_PASSWORD,
  SEED_AGENT_A_FINAL_BALANCE,
  SEED_AGENT_B_FINAL_BALANCE,
  SEED_AGENT_PASSWORD,
  SEED_SUPERADMIN_PASSWORD,
} from '../constants';
import { buildSeedUsers } from './build-seed-users.util';

describe('buildSeedUsers (FR-11)', (): void => {
  const create = (data: Partial<User>): User => data as User;

  it('creates 1 superadmin, 2 admins, 2 agents with expected balances', (): void => {
    const result = buildSeedUsers({ create }, new Date('2026-03-01T00:00:00.000Z'));

    expect(result.users).toHaveLength(5);
    const roles = result.users.map((u) => u.role).sort();
    expect(roles).toEqual(['admin', 'admin', 'agent', 'agent', 'superadmin']);

    const agentA = result.users.find((u) => u.id === result.agentAId);
    const agentB = result.users.find((u) => u.id === result.agentBId);
    expect(agentA?.balance).toBe(SEED_AGENT_A_FINAL_BALANCE);
    expect(agentB?.balance).toBe(SEED_AGENT_B_FINAL_BALANCE);
    expect(agentA?.invitePassword).toBe(SEED_AGENT_PASSWORD);
    expect(result.users.find((u) => u.role === 'superadmin')?.invitePassword).toBe(
      SEED_SUPERADMIN_PASSWORD,
    );
    expect(
      result.users.filter((u) => u.role === 'admin').every(
        (u) => u.invitePassword === SEED_ADMIN_PASSWORD,
      ),
    ).toBe(true);
  });
});
