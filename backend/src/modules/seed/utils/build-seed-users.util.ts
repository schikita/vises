import { hashPassword } from '../../../shared/utils';
import {
  SEED_ADMIN_INVITE_TOKEN,
  SEED_ADMIN_PASSWORD,
  SEED_ADMIN_USER_ID,
  SEED_CLIENT_INVITE_TOKEN,
  SEED_CLIENT_PASSWORD,
  SEED_CLIENT_USER_ID,
  SEED_EXTRA_CLIENT_COUNT,
  SEED_EXTRA_MANAGER_COUNT,
  SEED_FIRST_NAMES_FEMALE,
  SEED_FIRST_NAMES_MALE,
  SEED_LAST_NAMES_FEMALE,
  SEED_LAST_NAMES_MALE,
  SEED_MANAGER_DISPLAY_NAMES,
  SEED_MANAGER_INVITE_TOKEN,
  SEED_MANAGER_LOGIN_LOCALS,
  SEED_MANAGER_PASSWORD,
  SEED_MANAGER_USER_ID,
  SEED_RNG_SEED,
} from '../constants';
import type {
  BuildSeedUsersResult,
  SeedClientProfile,
  UserFactory,
} from '../types';
import { createSeedRng } from './create-seed-rng.util';
import { formatSeedDisplayName } from './format-seed-display-name.util';
import { pickSeedItem } from './pick-seed-item.util';

/** Fixed demo accounts + random managers/clients (active mix). */
export const buildSeedUsers = (
  users: UserFactory,
  now: Date,
): BuildSeedUsersResult => {
  const rng = createSeedRng(SEED_RNG_SEED);
  const adminHash = hashPassword(SEED_ADMIN_PASSWORD);
  const managerHash = hashPassword(SEED_MANAGER_PASSWORD);
  const clientHash = hashPassword(SEED_CLIENT_PASSWORD);

  const fixed = [
    users.create({
      id: SEED_ADMIN_USER_ID,
      name: 'Администратор Vises',
      login: 'admin',
      email: 'admin@vises.app',
      passwordHash: adminHash,
      invitePassword: SEED_ADMIN_PASSWORD,
      role: 'admin',
      active: true,
      inviteToken: SEED_ADMIN_INVITE_TOKEN,
      createdAt: now,
      updatedAt: now,
    }),
    users.create({
      id: SEED_MANAGER_USER_ID,
      name: 'Мария',
      login: 'maria@vises.app',
      email: 'maria@vises.app',
      passwordHash: managerHash,
      invitePassword: SEED_MANAGER_PASSWORD,
      role: 'manager',
      active: true,
      inviteToken: SEED_MANAGER_INVITE_TOKEN,
      createdAt: now,
      updatedAt: now,
    }),
    users.create({
      id: SEED_CLIENT_USER_ID,
      name: 'Анна Волкова',
      login: 'anna@example.com',
      email: 'anna@example.com',
      passwordHash: clientHash,
      invitePassword: SEED_CLIENT_PASSWORD,
      role: 'client',
      active: true,
      inviteToken: SEED_CLIENT_INVITE_TOKEN,
      createdAt: now,
      updatedAt: now,
    }),
  ];

  const managerNames = ['Мария', ...SEED_MANAGER_DISPLAY_NAMES];
  const extraManagers = [];
  for (let i = 0; i < SEED_EXTRA_MANAGER_COUNT; i += 1) {
    const name = SEED_MANAGER_DISPLAY_NAMES[i] ?? `Менеджер ${i + 1}`;
    const loginLocal = SEED_MANAGER_LOGIN_LOCALS[i] ?? `manager${i + 1}`;
    const login = `${loginLocal}@vises.app`;
    extraManagers.push(
      users.create({
        id: `u-mgr-${i + 1}`,
        name,
        login,
        email: login,
        passwordHash: managerHash,
        invitePassword: SEED_MANAGER_PASSWORD,
        role: 'manager',
        active: rng() >= 0.25,
        inviteToken: `seed-manager-${i + 1}`,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  const pavelClient: SeedClientProfile = {
    id: 'u-pavel',
    name: 'Павел Иванов',
    email: 'pavel@example.com',
    active: true,
  };

  const clients: SeedClientProfile[] = [
    {
      id: SEED_CLIENT_USER_ID,
      name: 'Анна Волкова',
      email: 'anna@example.com',
      active: true,
    },
    pavelClient,
  ];

  const extraClients = [
    users.create({
      id: pavelClient.id,
      name: pavelClient.name,
      login: pavelClient.email,
      email: pavelClient.email,
      passwordHash: clientHash,
      invitePassword: SEED_CLIENT_PASSWORD,
      role: 'client',
      active: true,
      inviteToken: 'seed-client-pavel',
      createdAt: now,
      updatedAt: now,
    }),
  ];

  for (let i = 0; i < SEED_EXTRA_CLIENT_COUNT; i += 1) {
    const gender = rng() < 0.5 ? 'female' : 'male';
    const firstName = pickSeedItem(
      gender === 'female' ? SEED_FIRST_NAMES_FEMALE : SEED_FIRST_NAMES_MALE,
      rng,
    );
    const lastName = pickSeedItem(
      gender === 'female' ? SEED_LAST_NAMES_FEMALE : SEED_LAST_NAMES_MALE,
      rng,
    );
    const name = formatSeedDisplayName(firstName, lastName);
    const email = `client.${i + 1}@example.com`;
    const active = rng() >= 0.2;
    const id = `u-client-${i + 1}`;
    clients.push({ id, name, email, active });
    extraClients.push(
      users.create({
        id,
        name,
        login: email,
        email,
        passwordHash: clientHash,
        invitePassword: SEED_CLIENT_PASSWORD,
        role: 'client',
        active,
        inviteToken: `seed-client-${i + 1}`,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  return {
    users: [...fixed, ...extraManagers, ...extraClients],
    clients,
    managerNames,
  };
};
