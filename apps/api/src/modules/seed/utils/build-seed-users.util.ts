import type { StaffRole } from '@vises/contracts';
import { hashPassword } from '../../../shared/utils';
import {
  SEED_ADMIN_1_INVITE_TOKEN,
  SEED_ADMIN_1_LOGIN,
  SEED_ADMIN_1_NAME,
  SEED_ADMIN_1_USER_ID,
  SEED_ADMIN_2_INVITE_TOKEN,
  SEED_ADMIN_2_LOGIN,
  SEED_ADMIN_2_NAME,
  SEED_ADMIN_2_USER_ID,
  SEED_ADMIN_PASSWORD,
  SEED_AGENT_PASSWORD,
  SEED_SUPERADMIN_INVITE_TOKEN,
  SEED_SUPERADMIN_LOGIN,
  SEED_SUPERADMIN_NAME,
  SEED_SUPERADMIN_PASSWORD,
  SEED_SUPERADMIN_USER_ID,
} from '../constants';
import type { BuildSeedUsersResult, UserFactory } from '../types';
import { addSeedUtcDays } from './add-seed-utc-days.util';
import { buildSeedAgentPlans } from './build-seed-agent-plans.util';
import { formatSeedMoney } from './format-seed-money.util';

/**
 * FR-11 staff users: 1 superadmin, 2 admins (unchanged), 20 generated agents.
 * Agent balances match ledger end-state after seed top_up + client debits.
 */
export const buildSeedUsers = (
  users: UserFactory,
  now: Date,
): BuildSeedUsersResult => {
  const superadminHash = hashPassword(SEED_SUPERADMIN_PASSWORD);
  const adminHash = hashPassword(SEED_ADMIN_PASSWORD);
  const agentHash = hashPassword(SEED_AGENT_PASSWORD);

  const superadminRole: StaffRole = 'superadmin';
  const adminRole: StaffRole = 'admin';
  const agentRole: StaffRole = 'agent';

  const agentPlans = buildSeedAgentPlans();

  /** Distinct createdAt so Users «Создан» sort is visible (newest first by default). */
  const createdAtForIndex = (index: number): Date =>
    addSeedUtcDays(now, -index);

  const staff = [
    users.create({
      id: SEED_SUPERADMIN_USER_ID,
      name: SEED_SUPERADMIN_NAME,
      login: SEED_SUPERADMIN_LOGIN,
      email: SEED_SUPERADMIN_LOGIN,
      passwordHash: superadminHash,
      invitePassword: SEED_SUPERADMIN_PASSWORD,
      role: superadminRole,
      balance: '0.00',
      active: true,
      inviteToken: SEED_SUPERADMIN_INVITE_TOKEN,
      createdAt: createdAtForIndex(0),
      updatedAt: createdAtForIndex(0),
    }),
    users.create({
      id: SEED_ADMIN_1_USER_ID,
      name: SEED_ADMIN_1_NAME,
      login: SEED_ADMIN_1_LOGIN,
      email: SEED_ADMIN_1_LOGIN,
      passwordHash: adminHash,
      invitePassword: SEED_ADMIN_PASSWORD,
      role: adminRole,
      balance: '0.00',
      active: true,
      inviteToken: SEED_ADMIN_1_INVITE_TOKEN,
      createdAt: createdAtForIndex(1),
      updatedAt: createdAtForIndex(1),
    }),
    users.create({
      id: SEED_ADMIN_2_USER_ID,
      name: SEED_ADMIN_2_NAME,
      login: SEED_ADMIN_2_LOGIN,
      email: SEED_ADMIN_2_LOGIN,
      passwordHash: adminHash,
      invitePassword: SEED_ADMIN_PASSWORD,
      role: adminRole,
      balance: '0.00',
      active: true,
      inviteToken: SEED_ADMIN_2_INVITE_TOKEN,
      createdAt: createdAtForIndex(2),
      updatedAt: createdAtForIndex(2),
    }),
  ];

  const agents = agentPlans.map((plan, index) => {
    const createdAt = createdAtForIndex(staff.length + index);
    return users.create({
      id: plan.userId,
      name: plan.name,
      login: plan.login,
      email: plan.login,
      passwordHash: agentHash,
      invitePassword: SEED_AGENT_PASSWORD,
      role: agentRole,
      balance: formatSeedMoney(plan.finalBalanceWhole, 1),
      active: true,
      inviteToken: plan.inviteToken,
      createdAt,
      updatedAt: createdAt,
    });
  });

  return {
    users: [...staff, ...agents],
    superadminId: SEED_SUPERADMIN_USER_ID,
    agentPlans,
  };
};
