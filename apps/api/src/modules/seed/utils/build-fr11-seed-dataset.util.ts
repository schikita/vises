import {
  SEED_AGENT_A_NAME,
  SEED_AGENT_A_STATUSES,
  SEED_AGENT_A_TOP_UP_AMOUNT,
  SEED_AGENT_B_NAME,
  SEED_AGENT_B_STATUSES,
  SEED_AGENT_B_TOP_UP_AMOUNT,
  SEED_DEFAULT_PRICE,
} from '../constants';
import type {
  BuildFr11SeedDatasetInput,
  BuildFr11SeedDatasetResult,
} from '../types';
import { buildAgentSeedLedger } from './build-agent-seed-ledger.util';
import { buildFr11AgentApps } from './build-fr11-agent-apps.util';

/**
 * Full FR-11 clients / applications / history / ledger composition (AC-19).
 * Passport fields are encrypted via `input.encryptFields` before Client create.
 */
export const buildFr11SeedDataset = (
  input: BuildFr11SeedDatasetInput,
): BuildFr11SeedDatasetResult => {
  const agentA = buildFr11AgentApps({
    applications: input.applications,
    clients: input.clients,
    history: input.history,
    agentId: input.agentAId,
    agentName: input.agentAName || SEED_AGENT_A_NAME,
    agentKey: 'a',
    statuses: SEED_AGENT_A_STATUSES,
    now: input.now,
    encryptFields: input.encryptFields,
    rngSeedOffset: 11,
  });

  const agentB = buildFr11AgentApps({
    applications: input.applications,
    clients: input.clients,
    history: input.history,
    agentId: input.agentBId,
    agentName: input.agentBName || SEED_AGENT_B_NAME,
    agentKey: 'b',
    statuses: SEED_AGENT_B_STATUSES,
    now: input.now,
    encryptFields: input.encryptFields,
    rngSeedOffset: 29,
  });

  const agentATopUpWhole = Number.parseInt(
    SEED_AGENT_A_TOP_UP_AMOUNT.split('.')[0] ?? '1800',
    10,
  );
  const agentBTopUpWhole = Number.parseInt(
    SEED_AGENT_B_TOP_UP_AMOUNT.split('.')[0] ?? '900',
    10,
  );

  const ledgerA = buildAgentSeedLedger({
    ledger: input.ledger,
    agentId: input.agentAId,
    topUpActorId: input.superadminId,
    topUpAmountWhole: agentATopUpWhole,
    clientIds: agentA.clientIds,
    idPrefix: 'btx-a',
    baseTime: input.now,
  });

  const ledgerB = buildAgentSeedLedger({
    ledger: input.ledger,
    agentId: input.agentBId,
    topUpActorId: input.superadminId,
    topUpAmountWhole: agentBTopUpWhole,
    clientIds: agentB.clientIds,
    idPrefix: 'btx-b',
    baseTime: input.now,
  });

  // Guardrail: composition math must match FR-11 final balances.
  const expectedA =
    agentATopUpWhole - agentA.clientIds.length * SEED_DEFAULT_PRICE;
  const expectedB =
    agentBTopUpWhole - agentB.clientIds.length * SEED_DEFAULT_PRICE;
  if (expectedA !== 360 || expectedB !== 0) {
    throw new Error(
      `FR-11 balance composition mismatch: A=${expectedA} B=${expectedB}`,
    );
  }

  return {
    clients: [...agentA.clients, ...agentB.clients],
    applications: [...agentA.applications, ...agentB.applications],
    history: [...agentA.history, ...agentB.history],
    ledger: [...ledgerA, ...ledgerB],
  };
};
