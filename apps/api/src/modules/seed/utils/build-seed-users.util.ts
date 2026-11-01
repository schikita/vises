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
  SEED_AGENT_A_FINAL_BALANCE,
  SEED_AGENT_A_INVITE_TOKEN,
  SEED_AGENT_A_LOGIN,
  SEED_AGENT_A_NAME,
  SEED_AGENT_A_USER_ID,
  SEED_AGENT_B_FINAL_BALANCE,
  SEED_AGENT_B_INVITE_TOKEN,
  SEED_AGENT_B_LOGIN,
  SEED_AGENT_B_NAME,
  SEED_AGENT_B_USER_ID,
  SEED_AGENT_PASSWORD,
  SEED_SUPERADMIN_INVITE_TOKEN,
  SEED_SUPERADMIN_LOGIN,
  SEED_SUPERADMIN_NAME,
  SEED_SUPERADMIN_PASSWORD,
  SEED_SUPERADMIN_USER_ID,
} from '../constants';
import type { BuildSeedUsersResult, UserFactory } from '../types';

/**
 * FR-11 staff users: 1 superadmin, 2 admins, 2 agents (Agent A / Agent B).
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

  const seeded = [
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
      createdAt: now,
      updatedAt: now,
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
      createdAt: now,
      updatedAt: now,
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
      createdAt: now,
      updatedAt: now,
    }),
    users.create({
      id: SEED_AGENT_A_USER_ID,
      name: SEED_AGENT_A_NAME,
      login: SEED_AGENT_A_LOGIN,
      email: SEED_AGENT_A_LOGIN,
      passwordHash: agentHash,
      invitePassword: SEED_AGENT_PASSWORD,
      role: agentRole,
      balance: SEED_AGENT_A_FINAL_BALANCE,
      active: true,
      inviteToken: SEED_AGENT_A_INVITE_TOKEN,
      createdAt: now,
      updatedAt: now,
    }),
    users.create({
      id: SEED_AGENT_B_USER_ID,
      name: SEED_AGENT_B_NAME,
      login: SEED_AGENT_B_LOGIN,
      email: SEED_AGENT_B_LOGIN,
      passwordHash: agentHash,
      invitePassword: SEED_AGENT_PASSWORD,
      role: agentRole,
      balance: SEED_AGENT_B_FINAL_BALANCE,
      active: true,
      inviteToken: SEED_AGENT_B_INVITE_TOKEN,
      createdAt: now,
      updatedAt: now,
    }),
  ];

  return {
    users: seeded,
    superadminId: SEED_SUPERADMIN_USER_ID,
    agentAId: SEED_AGENT_A_USER_ID,
    agentBId: SEED_AGENT_B_USER_ID,
  };
};
