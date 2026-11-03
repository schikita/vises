import type { ApplicationStatus } from '@vises/contracts';
import type { ApplicationStatusHistory } from '../../database/entities/application-status-history.entity';
import type { Application } from '../../database/entities/application.entity';
import type { BalanceTransaction } from '../../database/entities/balance-transaction.entity';
import type { Client } from '../../database/entities/client.entity';
import { PII_ENCRYPTED_FIELD_KEYS } from '../../pii';
import type { PiiEncryptedFieldMap } from '../../pii';
import {
  SEED_CLIENTS_PER_AGENT_MAX,
  SEED_CLIENTS_PER_AGENT_MIN,
  SEED_DEFAULT_PRICE,
  SEED_SUPERADMIN_USER_ID,
  SEED_TIMELINE_ACTOR,
} from '../constants';
import { buildSeedAgentPlans } from './build-seed-agent-plans.util';
import { buildFr11SeedDataset } from './build-fr11-seed-dataset.util';
import { formatSeedMoney } from './format-seed-money.util';

const STUB_CIPHER_PREFIX = 'cipher:';

/** FR-6 values that must never appear plaintext on Application JSON rows. */
const APPLICATION_FORBIDDEN_PLAIN_KEYS = new Set([
  'firstName',
  'lastName',
  'lastNameAtBirth',
  'passportNumber',
  'passportIssued',
  'passportExpires',
  'passportIssuedBy',
  'dob',
  'nationalId',
  'otherNames',
]);

describe('buildFr11SeedDataset (AC-19 / FR-11)', (): void => {
  const createClient = (data: Partial<Client>): Client => data as Client;
  const createApp = (data: Partial<Application>): Application =>
    data as Application;
  const createHistory = (
    data: Partial<ApplicationStatusHistory>,
  ): ApplicationStatusHistory => data as ApplicationStatusHistory;
  const createLedger = (
    data: Partial<BalanceTransaction>,
  ): BalanceTransaction => data as BalanceTransaction;

  const plaintextFr6Values: string[] = [];
  const forbiddenApplicationPlains: string[] = [];
  const stubEncryptFields = (
    fields: PiiEncryptedFieldMap,
  ): PiiEncryptedFieldMap => {
    const out: PiiEncryptedFieldMap = {};
    for (const key of PII_ENCRYPTED_FIELD_KEYS) {
      if (!(key in fields)) {
        continue;
      }
      const value = fields[key];
      if (value === null || value === undefined) {
        out[key] = value ?? null;
        continue;
      }
      plaintextFr6Values.push(value);
      if (APPLICATION_FORBIDDEN_PLAIN_KEYS.has(key)) {
        forbiddenApplicationPlains.push(value);
      }
      out[key] = `${STUB_CIPHER_PREFIX}${value}`;
    }
    return out;
  };

  const agentPlans = buildSeedAgentPlans();
  const dataset = buildFr11SeedDataset({
    applications: { create: createApp },
    clients: { create: createClient },
    history: { create: createHistory },
    ledger: { create: createLedger },
    superadminId: SEED_SUPERADMIN_USER_ID,
    agentPlans,
    now: new Date('2026-03-01T12:00:00.000Z'),
    encryptFields: stubEncryptFields,
  });

  const expectedClientCount = agentPlans.reduce(
    (sum, plan) => sum + plan.clientCount,
    0,
  );

  it('seeds 1:1 clients and applications for all agents within 2–50 bounds', (): void => {
    expect(dataset.clients).toHaveLength(expectedClientCount);
    expect(dataset.applications).toHaveLength(expectedClientCount);
    expect(agentPlans.every((plan) =>
      plan.clientCount >= SEED_CLIENTS_PER_AGENT_MIN &&
      plan.clientCount <= SEED_CLIENTS_PER_AGENT_MAX,
    )).toBe(true);

    const clientIds = new Set(dataset.clients.map((c) => c.id));
    const appClientIds = dataset.applications.map((a) => a.clientId);
    expect(new Set(appClientIds).size).toBe(expectedClientCount);
    expect(appClientIds.every((id) => clientIds.has(id))).toBe(true);

    for (const plan of agentPlans) {
      const agentClients = dataset.clients.filter((c) => c.agentId === plan.userId);
      expect(agentClients).toHaveLength(plan.clientCount);
    }
  });

  it('covers every status at least once globally', (): void => {
    const statuses = new Set(dataset.applications.map((a) => a.status));
    expect(statuses).toEqual(
      new Set<ApplicationStatus>([
        'drafting',
        'pending',
        'rejected',
        'booked',
        'issued',
      ]),
    );
  });

  it('writes stub ciphertext into Client FR-6 columns (not plaintext)', (): void => {
    expect(plaintextFr6Values.length).toBeGreaterThan(0);
    for (const client of dataset.clients) {
      expect(client.firstName?.startsWith(STUB_CIPHER_PREFIX)).toBe(true);
      expect(client.lastName?.startsWith(STUB_CIPHER_PREFIX)).toBe(true);
      expect(client.passportNumber?.startsWith(STUB_CIPHER_PREFIX)).toBe(true);
      expect(client.firstName).not.toBe(
        client.firstName?.slice(STUB_CIPHER_PREFIX.length),
      );
    }
  });

  it('keeps Application rows free of plaintext FR-6 name/passport values', (): void => {
    const uniqueForbidden = [...new Set(forbiddenApplicationPlains)];
    expect(uniqueForbidden.length).toBeGreaterThan(0);

    for (const app of dataset.applications) {
      const serialized = JSON.stringify(app);
      for (const plain of uniqueForbidden) {
        expect(serialized.includes(plain)).toBe(false);
      }
      const timeline = app.timeline as Array<{ actor?: string }>;
      expect(timeline.every((entry) => entry.actor === SEED_TIMELINE_ACTOR)).toBe(
        true,
      );
    }
  });

  it('seeds ledger top_ups and debits with client ids + remaining unused slots', (): void => {
    for (const plan of agentPlans) {
      const rows = dataset.ledger.filter((row) => row.agentId === plan.userId);
      expect(rows).toHaveLength(1 + plan.clientCount);
      expect(rows[0]?.type).toBe('top_up');
      expect(rows[0]?.reason).toBe('seed');
      expect(rows[0]?.amount).toBe(formatSeedMoney(plan.topUpAmountWhole, 1));
      expect(rows[rows.length - 1]?.resultingBalance).toBe(
        formatSeedMoney(plan.finalBalanceWhole, 1),
      );
      expect(plan.finalBalanceWhole).toBe(plan.extraSlots * SEED_DEFAULT_PRICE);
      expect(
        rows.slice(1).every((row) => typeof row.clientId === 'string'),
      ).toBe(true);
    }
  });

  it('includes drafting→pending and booked→issued history where applicable', (): void => {
    const pairs = dataset.history.map(
      (h) => `${h.fromStatus}->${h.toStatus}`,
    );
    expect(pairs.filter((p) => p === 'drafting->pending').length).toBeGreaterThan(
      0,
    );
    expect(pairs.filter((p) => p === 'booked->issued').length).toBeGreaterThan(0);

    const issuedApps = dataset.applications.filter((a) => a.status === 'issued');
    expect(issuedApps.length).toBeGreaterThan(0);
    for (const app of issuedApps) {
      const appHistory = dataset.history.filter(
        (h) => h.applicationId === app.id,
      );
      expect(
        appHistory.some(
          (h) => h.fromStatus === 'drafting' && h.toStatus === 'pending',
        ),
      ).toBe(true);
      expect(
        appHistory.some(
          (h) => h.fromStatus === 'booked' && h.toStatus === 'issued',
        ),
      ).toBe(true);
    }
  });
});
