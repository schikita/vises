import type { AnalyticsHistoryEvent } from '../types';
import { buildAnalyticsApplicationFacts } from './build-analytics-application-facts.util';

describe('buildAnalyticsApplicationFacts (AC-16)', (): void => {
  it('uses latest history toStatus, ignoring any mutable status argument', (): void => {
    const history: AnalyticsHistoryEvent[] = [
      {
        applicationId: 'app-1',
        fromStatus: 'drafting',
        toStatus: 'pending',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      },
      {
        applicationId: 'app-1',
        fromStatus: 'pending',
        toStatus: 'booked',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
      },
    ];

    const facts = buildAnalyticsApplicationFacts(
      [{ applicationId: 'app-1', agentId: 'agent-1' }],
      history,
    );

    expect(facts).toHaveLength(1);
    const fact = facts[0];
    expect(fact).toBeDefined();
    if (fact === undefined) {
      return;
    }
    expect(fact.effectiveStatus).toBe('booked');
    expect(fact.receivedAt).toEqual(new Date('2026-01-02T00:00:00.000Z'));
    expect(fact.issuedAt).toBeNull();
  });

  it('defaults to drafting when history is empty (no mutable fallback)', (): void => {
    const facts = buildAnalyticsApplicationFacts(
      [{ applicationId: 'app-2', agentId: 'agent-1' }],
      [],
    );
    const fact = facts[0];
    expect(fact).toBeDefined();
    if (fact === undefined) {
      return;
    }
    expect(fact.effectiveStatus).toBe('drafting');
    expect(fact.receivedAt).toBeNull();
    expect(fact.issuedAt).toBeNull();
  });

  it('derives issuedAt from first booked → issued transition', (): void => {
    const history: AnalyticsHistoryEvent[] = [
      {
        applicationId: 'app-3',
        fromStatus: 'drafting',
        toStatus: 'pending',
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
      },
      {
        applicationId: 'app-3',
        fromStatus: 'pending',
        toStatus: 'booked',
        createdAt: new Date('2026-02-02T00:00:00.000Z'),
      },
      {
        applicationId: 'app-3',
        fromStatus: 'booked',
        toStatus: 'issued',
        createdAt: new Date('2026-02-03T00:00:00.000Z'),
      },
    ];

    const facts = buildAnalyticsApplicationFacts(
      [{ applicationId: 'app-3', agentId: 'agent-2' }],
      history,
    );

    const fact = facts[0];
    expect(fact).toBeDefined();
    if (fact === undefined) {
      return;
    }
    expect(fact.effectiveStatus).toBe('issued');
    expect(fact.issuedAt).toEqual(new Date('2026-02-03T00:00:00.000Z'));
  });

  it('prefers history even when a later mutable status would diverge', (): void => {
    // History ends at pending; mutable Application.status is not consulted.
    const history: AnalyticsHistoryEvent[] = [
      {
        applicationId: 'app-4',
        fromStatus: 'drafting',
        toStatus: 'pending',
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
      },
    ];

    const facts = buildAnalyticsApplicationFacts(
      [{ applicationId: 'app-4', agentId: 'agent-1' }],
      history,
    );

    const fact = facts[0];
    expect(fact).toBeDefined();
    if (fact === undefined) {
      return;
    }
    expect(fact.effectiveStatus).toBe('pending');
  });
});
