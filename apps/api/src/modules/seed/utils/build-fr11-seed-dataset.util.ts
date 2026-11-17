import type { ApplicationStatusHistory } from '../../database/entities/application-status-history.entity';
import type { Application } from '../../database/entities/application.entity';
import type { BalanceTransaction } from '../../database/entities/balance-transaction.entity';
import type { Client } from '../../database/entities/client.entity';
import { SEED_DEFAULT_PRICE } from '../constants';
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
  const clients: Client[] = [];
  const applications: Application[] = [];
  const history: ApplicationStatusHistory[] = [];
  const ledger: BalanceTransaction[] = [];

  for (const plan of input.agentPlans) {
    const agentApps = buildFr11AgentApps({
      applications: input.applications,
      clients: input.clients,
      history: input.history,
      agentId: plan.userId,
      agentName: plan.name,
      agentKey: plan.ordinal,
      statuses: plan.statuses,
      now: input.now,
      encryptFields: input.encryptFields,
      rngSeedOffset: plan.rngSeedOffset,
    });

    if (agentApps.clientIds.length !== plan.clientCount) {
      throw new Error(
        `FR-11 client count mismatch for ${plan.userId}: expected ${plan.clientCount}, got ${agentApps.clientIds.length}`,
      );
    }

    const agentLedger = buildAgentSeedLedger({
      ledger: input.ledger,
      agentId: plan.userId,
      topUpActorId: input.superadminId,
      topUpAmountWhole: plan.topUpAmountWhole,
      clientIds: agentApps.clientIds,
      idPrefix: `btx-${plan.ordinal}`,
      baseTime: input.now,
    });

    const expectedBalance =
      plan.topUpAmountWhole - plan.clientCount * SEED_DEFAULT_PRICE;
    if (expectedBalance !== plan.finalBalanceWhole) {
      throw new Error(
        `FR-11 balance composition mismatch for ${plan.userId}: expected ${plan.finalBalanceWhole}, got ${expectedBalance}`,
      );
    }

    clients.push(...agentApps.clients);
    applications.push(...agentApps.applications);
    history.push(...agentApps.history);
    ledger.push(...agentLedger);
  }

  return {
    clients,
    applications,
    history,
    ledger,
  };
};
