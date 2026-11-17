import type { AnalyticsApplicationFact } from '../types';
import { buildAnalyticsDto } from './build-analytics-dto.util';

const makeFact = (
  partial: Pick<
    AnalyticsApplicationFact,
    | 'applicationId'
    | 'agentId'
    | 'effectiveStatus'
    | 'bookedAt'
    | 'createdAt'
    | 'paymentPaid'
    | 'paymentAmount'
    | 'submitCity'
    | 'visitDate'
  >,
): AnalyticsApplicationFact => ({
  ...partial,
  receivedAt: null,
});

describe('buildAnalyticsDto (AC-15 / DEC-ASAU-003 / DEC-ASAU-009)', (): void => {
  const facts: AnalyticsApplicationFact[] = [
    makeFact({
      applicationId: 'a1',
      agentId: 'agent-a',
      effectiveStatus: 'draft',
      bookedAt: null,
      createdAt: new Date('2026-01-05T00:00:00.000Z'),
      paymentPaid: false,
      paymentAmount: 180,
      submitCity: 'Moscow',
      visitDate: '',
    }),
    makeFact({
      applicationId: 'a2',
      agentId: 'agent-a',
      effectiveStatus: 'not_ready_for_appointment',
      bookedAt: new Date('2026-01-10T00:00:00.000Z'),
      createdAt: new Date('2026-01-10T00:00:00.000Z'),
      paymentPaid: true,
      paymentAmount: 200,
      submitCity: 'Moscow',
      visitDate: '',
    }),
    makeFact({
      applicationId: 'a3',
      agentId: 'agent-a',
      effectiveStatus: 'booked',
      bookedAt: new Date('2026-01-12T00:00:00.000Z'),
      createdAt: new Date('2026-01-12T00:00:00.000Z'),
      paymentPaid: false,
      paymentAmount: 180,
      submitCity: 'Kazan',
      visitDate: '2026-01-20',
    }),
    makeFact({
      applicationId: 'b1',
      agentId: 'agent-b',
      effectiveStatus: 'booked',
      bookedAt: new Date('2026-02-01T00:00:00.000Z'),
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
      paymentPaid: true,
      paymentAmount: 250,
      submitCity: 'Moscow',
      visitDate: '2026-02-05',
    }),
  ];

  const clients = [
    { agentId: 'agent-a' },
    { agentId: 'agent-a' },
    { agentId: 'agent-a' },
    { agentId: 'agent-b' },
  ];

  const agentBalances = [
    { agentId: 'agent-a', balance: '120.50' },
    { agentId: 'agent-b', balance: '40.00' },
  ];

  it('computes global and per-agent percentages as decimal strings', (): void => {
    const dto = buildAnalyticsDto({
      facts,
      clients,
      agentBalances,
      agentScopeId: null,
      dateRange: null,
    });

    expect(dto.global.totalApplications).toBe(4);
    const notReady = dto.global.byStatus.find(
      (b) => b.status === 'not_ready_for_appointment',
    );
    expect(notReady).toEqual({
      status: 'not_ready_for_appointment',
      count: 1,
      percentage: '25.00',
    });

    const agentA = dto.perAgent.find((p) => p.agentId === 'agent-a');
    expect(agentA?.totalApplications).toBe(3);
    expect(
      agentA?.byStatus.find((b) => b.status === 'draft')?.percentage,
    ).toBe('33.33');

    expect(dto.clientsPerAgent).toEqual([
      {
        agentId: 'agent-a',
        count: 3,
        percentage: '75.00',
        balance: '120.50',
        registered: 3,
        paid: 1,
        paidAmount: '200.00',
      },
      {
        agentId: 'agent-b',
        count: 1,
        percentage: '25.00',
        balance: '40.00',
        registered: 1,
        paid: 1,
        paidAmount: '250.00',
      },
    ]);
  });

  it('populates §5.1 aggregates from application payment/city/visit fields', (): void => {
    const dto = buildAnalyticsDto({
      facts,
      clients,
      agentBalances,
      agentScopeId: null,
      dateRange: null,
    });

    expect(dto.bookedVsUnpaid).toEqual({
      bookedCount: 2,
      unpaidCount: 2,
    });
    expect(dto.cityDistribution).toEqual([
      { city: 'Kazan', count: 1, percentage: '25.00' },
      { city: 'Moscow', count: 3, percentage: '75.00' },
    ]);
    expect(dto.paymentCompleteness).toEqual({
      totalApplications: 4,
      paidCount: 2,
      completenessPercentage: '50.00',
    });
    expect(dto.paidVolumeByAgent).toEqual([
      { agentId: 'agent-a', paidAmount: '200.00', paidCount: 1 },
      { agentId: 'agent-b', paidAmount: '250.00', paidCount: 1 },
    ]);
  });

  it('zero-fills all six BUSINESS status buckets', (): void => {
    const dto = buildAnalyticsDto({
      facts,
      clients,
      agentBalances,
      agentScopeId: null,
      dateRange: null,
    });

    expect(dto.global.byStatus.map((b) => b.status)).toEqual([
      'filling',
      'draft',
      'not_ready_for_appointment',
      'ready_for_appointment',
      'booked',
      'declined',
    ]);
  });

  it('filters status metrics and clientsPerAgent by createdAt', (): void => {
    const dto = buildAnalyticsDto({
      facts,
      clients,
      agentBalances,
      agentScopeId: null,
      dateRange: {
        from: new Date('2026-01-01T00:00:00.000Z'),
        to: new Date('2026-01-31T23:59:59.999Z'),
      },
    });

    // a1/a2/a3 created in January (includes draft without bookedAt)
    expect(dto.global.totalApplications).toBe(3);
    expect(dto.perAgent.map((p) => p.agentId)).toEqual(['agent-a']);
    expect(dto.clientsPerAgent).toEqual([
      {
        agentId: 'agent-a',
        count: 3,
        percentage: '100.00',
        balance: '120.50',
        registered: 3,
        paid: 1,
        paidAmount: '200.00',
      },
    ]);
    expect(dto.bookedVsUnpaid).toEqual({
      bookedCount: 1,
      unpaidCount: 2,
    });
    expect(dto.paymentCompleteness).toEqual({
      totalApplications: 3,
      paidCount: 1,
      completenessPercentage: '33.33',
    });
    expect(dto.paidVolumeByAgent).toEqual([
      { agentId: 'agent-a', paidAmount: '200.00', paidCount: 1 },
    ]);
  });

  it('scopes all series to a single agent and never leaks other balances', (): void => {
    const dto = buildAnalyticsDto({
      facts,
      clients,
      agentBalances,
      agentScopeId: 'agent-b',
      dateRange: null,
    });

    expect(dto.perAgent).toHaveLength(1);
    const scopedAgent = dto.perAgent[0];
    expect(scopedAgent).toBeDefined();
    if (scopedAgent === undefined) {
      return;
    }
    expect(scopedAgent.agentId).toBe('agent-b');
    expect(dto.global.totalApplications).toBe(1);
    expect(dto.clientsPerAgent).toEqual([
      {
        agentId: 'agent-b',
        count: 1,
        percentage: '100.00',
        balance: '40.00',
        registered: 1,
        paid: 1,
        paidAmount: '250.00',
      },
    ]);
    expect(
      dto.clientsPerAgent.every((row) => row.agentId === 'agent-b'),
    ).toBe(true);
    expect(dto.paidVolumeByAgent).toEqual([
      { agentId: 'agent-b', paidAmount: '250.00', paidCount: 1 },
    ]);
    expect(dto.bookedVsUnpaid).toEqual({
      bookedCount: 1,
      unpaidCount: 0,
    });
  });
});
