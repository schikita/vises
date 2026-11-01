import type {
  AnalyticsAppOwnerRow,
  AnalyticsApplicationFact,
  AnalyticsHistoryEvent,
} from '../types';
import { resolveEffectiveStatus } from './resolve-effective-status.util';
import { resolveIssuedAt } from './resolve-issued-at.util';
import { resolveReceivedAt } from './resolve-received-at.util';

/**
 * Build per-application facts from owners + history (AC-16).
 * Mutable Application.status is intentionally unused.
 */
export const buildAnalyticsApplicationFacts = (
  owners: AnalyticsAppOwnerRow[],
  history: AnalyticsHistoryEvent[],
): AnalyticsApplicationFact[] => {
  const byApp = new Map<string, AnalyticsHistoryEvent[]>();
  for (const event of history) {
    const list = byApp.get(event.applicationId);
    if (list) {
      list.push(event);
    } else {
      byApp.set(event.applicationId, [event]);
    }
  }

  for (const list of byApp.values()) {
    list.sort(
      (a, b): number => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  return owners.map((owner): AnalyticsApplicationFact => {
    const events = byApp.get(owner.applicationId) ?? [];
    return {
      applicationId: owner.applicationId,
      agentId: owner.agentId,
      effectiveStatus: resolveEffectiveStatus(events),
      receivedAt: resolveReceivedAt(events),
      issuedAt: resolveIssuedAt(events),
    };
  });
};
