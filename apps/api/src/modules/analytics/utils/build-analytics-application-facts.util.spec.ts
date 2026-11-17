import type { AnalyticsHistoryEvent } from '../types';
import { buildAnalyticsApplicationFacts } from './build-analytics-application-facts.util';

describe('buildAnalyticsApplicationFacts (AC-16 / FR-15)', (): void => {
  it('uses latest history toStatus, ignoring any mutable status argument', (): void => {
    const history: AnalyticsHistoryEvent[] = [
      {
        applicationId: 'app-1',
        fromStatus: 'draft',
        toStatus: 'not_ready_for_appointment',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      },
      {
        applicationId: 'app-1',
        fromStatus: 'not_ready_for_appointment',
        toStatus: 'ready_for_appointment',
        createdAt: new Date('2026-01-02T12:00:00.000Z'),
      },
      {
        applicationId: 'app-1',
        fromStatus: 'ready_for_appointment',
        toStatus: 'booked',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
      },
    ];

    const facts = buildAnalyticsApplicationFacts(
      [
        {
          applicationId: 'app-1',
          agentId: 'agent-1',
          paymentPaid: true,
          paymentAmount: 200,
          submitCity: 'Moscow',
          visitDate: '2026-01-10',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
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
    expect(fact.bookedAt).toEqual(new Date('2026-01-03T00:00:00.000Z'));
    expect(fact.createdAt).toEqual(new Date('2026-01-01T00:00:00.000Z'));
    expect(fact.paymentPaid).toBe(true);
    expect(fact.paymentAmount).toBe(200);
    expect(fact.submitCity).toBe('Moscow');
    expect(fact.visitDate).toBe('2026-01-10');
  });

  it('defaults to draft when history is empty (no mutable fallback)', (): void => {
    const facts = buildAnalyticsApplicationFacts(
      [
        {
          applicationId: 'app-2',
          agentId: 'agent-1',
          paymentPaid: false,
          paymentAmount: 180,
          submitCity: '',
          visitDate: '',
          createdAt: new Date('2026-01-05T00:00:00.000Z'),
        },
      ],
      [],
    );
    const fact = facts[0];
    expect(fact).toBeDefined();
    if (fact === undefined) {
      return;
    }
    expect(fact.effectiveStatus).toBe('draft');
    expect(fact.receivedAt).toBeNull();
    expect(fact.bookedAt).toBeNull();
    expect(fact.createdAt).toEqual(new Date('2026-01-05T00:00:00.000Z'));
  });

  it('derives bookedAt from first transition into booked (not issued)', (): void => {
    const history: AnalyticsHistoryEvent[] = [
      {
        applicationId: 'app-3',
        fromStatus: 'draft',
        toStatus: 'not_ready_for_appointment',
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
      },
      {
        applicationId: 'app-3',
        fromStatus: 'not_ready_for_appointment',
        toStatus: 'ready_for_appointment',
        createdAt: new Date('2026-02-02T00:00:00.000Z'),
      },
      {
        applicationId: 'app-3',
        fromStatus: 'ready_for_appointment',
        toStatus: 'booked',
        createdAt: new Date('2026-02-03T00:00:00.000Z'),
      },
      {
        applicationId: 'app-3',
        fromStatus: 'booked',
        toStatus: 'ready_for_appointment',
        createdAt: new Date('2026-02-04T00:00:00.000Z'),
      },
    ];

    const facts = buildAnalyticsApplicationFacts(
      [
        {
          applicationId: 'app-3',
          agentId: 'agent-2',
          paymentPaid: false,
          paymentAmount: 180,
          submitCity: 'Kazan',
          visitDate: '',
          createdAt: new Date('2026-02-01T00:00:00.000Z'),
        },
      ],
      history,
    );

    const fact = facts[0];
    expect(fact).toBeDefined();
    if (fact === undefined) {
      return;
    }
    expect(fact.effectiveStatus).toBe('ready_for_appointment');
    expect(fact.bookedAt).toEqual(new Date('2026-02-03T00:00:00.000Z'));
    expect(fact.receivedAt).toEqual(new Date('2026-02-01T00:00:00.000Z'));
  });

  it('falls back receivedAt to first history when never not_ready', (): void => {
    const history: AnalyticsHistoryEvent[] = [
      {
        applicationId: 'app-5',
        fromStatus: 'draft',
        toStatus: 'filling',
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
      },
    ];

    const facts = buildAnalyticsApplicationFacts(
      [
        {
          applicationId: 'app-5',
          agentId: 'agent-1',
          paymentPaid: false,
          paymentAmount: 180,
          submitCity: '',
          visitDate: '',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
        },
      ],
      history,
    );

    const fact = facts[0];
    expect(fact).toBeDefined();
    if (fact === undefined) {
      return;
    }
    expect(fact.effectiveStatus).toBe('filling');
    expect(fact.receivedAt).toEqual(new Date('2026-04-01T00:00:00.000Z'));
    expect(fact.bookedAt).toBeNull();
  });

  it('prefers history even when a later mutable status would diverge', (): void => {
    // History ends at not_ready; mutable Application.status is not consulted.
    const history: AnalyticsHistoryEvent[] = [
      {
        applicationId: 'app-4',
        fromStatus: 'draft',
        toStatus: 'not_ready_for_appointment',
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
      },
    ];

    const facts = buildAnalyticsApplicationFacts(
      [
        {
          applicationId: 'app-4',
          agentId: 'agent-1',
          paymentPaid: false,
          paymentAmount: 180,
          submitCity: '',
          visitDate: '',
          createdAt: new Date('2026-03-01T00:00:00.000Z'),
        },
      ],
      history,
    );

    const fact = facts[0];
    expect(fact).toBeDefined();
    if (fact === undefined) {
      return;
    }
    expect(fact.effectiveStatus).toBe('not_ready_for_appointment');
  });
});
