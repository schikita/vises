import type { ApplicationStatus } from '@vises/contracts';
import type { ApplicationStatusHistory } from '../../database/entities/application-status-history.entity';
import type { Application } from '../../database/entities/application.entity';
import type { BalanceTransaction } from '../../database/entities/balance-transaction.entity';
import type { Client } from '../../database/entities/client.entity';
import { PII_ENCRYPTED_FIELD_KEYS } from '../../pii';
import type { PiiEncryptedFieldMap } from '../../pii';
import {
  SEED_AGENT_A_USER_ID,
  SEED_AGENT_B_USER_ID,
  SEED_SUPERADMIN_USER_ID,
  SEED_TIMELINE_ACTOR,
} from '../constants';
import { buildFr11SeedDataset } from './build-fr11-seed-dataset.util';

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

const countByStatus = (
  apps: Application[],
  agentId: string,
): Record<ApplicationStatus, number> => {
  const counts: Record<ApplicationStatus, number> = {
    drafting: 0,
    pending: 0,
    rejected: 0,
    booked: 0,
    issued: 0,
  };
  for (const app of apps) {
    const client = app.clientId;
    const belongsToA = client.startsWith('c-a-');
    const belongsToB = client.startsWith('c-b-');
    if (agentId === SEED_AGENT_A_USER_ID && !belongsToA) {
      continue;
    }
    if (agentId === SEED_AGENT_B_USER_ID && !belongsToB) {
      continue;
    }
    counts[app.status] += 1;
  }
  return counts;
};

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

  const dataset = buildFr11SeedDataset({
    applications: { create: createApp },
    clients: { create: createClient },
    history: { create: createHistory },
    ledger: { create: createLedger },
    superadminId: SEED_SUPERADMIN_USER_ID,
    agentAId: SEED_AGENT_A_USER_ID,
    agentBId: SEED_AGENT_B_USER_ID,
    agentAName: 'Agent A',
    agentBName: 'Agent B',
    now: new Date('2026-03-01T12:00:00.000Z'),
    encryptFields: stubEncryptFields,
  });

  it('seeds 13 clients and 13 applications with linked clientId values', (): void => {
    expect(dataset.clients).toHaveLength(13);
    expect(dataset.applications).toHaveLength(13);
    const clientIds = new Set(dataset.clients.map((c) => c.id));
    const appClientIds = dataset.applications.map((a) => a.clientId);
    expect(new Set(appClientIds).size).toBe(13);
    expect(appClientIds.every((id) => clientIds.has(id))).toBe(true);
  });

  it('matches Agent A / Agent B status distributions', (): void => {
    expect(countByStatus(dataset.applications, SEED_AGENT_A_USER_ID)).toEqual({
      drafting: 2,
      pending: 2,
      rejected: 1,
      booked: 2,
      issued: 1,
    });
    expect(countByStatus(dataset.applications, SEED_AGENT_B_USER_ID)).toEqual({
      drafting: 1,
      pending: 1,
      rejected: 0,
      booked: 2,
      issued: 1,
    });
  });

  it('covers every status at least once globally', (): void => {
    const statuses = new Set(dataset.applications.map((a) => a.status));
    expect(statuses).toEqual(
      new Set(['drafting', 'pending', 'rejected', 'booked', 'issued']),
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

  it('seeds ledger top_ups and debits with client ids + resulting balances', (): void => {
    const agentARows = dataset.ledger.filter(
      (row) => row.agentId === SEED_AGENT_A_USER_ID,
    );
    const agentBRows = dataset.ledger.filter(
      (row) => row.agentId === SEED_AGENT_B_USER_ID,
    );
    expect(agentARows).toHaveLength(9);
    expect(agentBRows).toHaveLength(6);
    expect(agentARows[0]?.reason).toBe('seed');
    expect(agentARows[agentARows.length - 1]?.resultingBalance).toBe('360.00');
    expect(agentBRows[agentBRows.length - 1]?.resultingBalance).toBe('0.00');
    expect(
      agentARows.slice(1).every((row) => typeof row.clientId === 'string'),
    ).toBe(true);
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
