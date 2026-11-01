import type { AnalyticsApplicationFact } from '../types';
import { buildAnalyticsDto } from './build-analytics-dto.util';

const makeFact = (
  partial: Pick<
    AnalyticsApplicationFact,
    'applicationId' | 'agentId' | 'effectiveStatus' | 'receivedAt'
  >,
): AnalyticsApplicationFact => ({
  ...partial,
  issuedAt: null,
});

describe('buildAnalyticsDto (AC-15 / AC-15a / AC-15b / §6.7.1)', (): void => {
  const facts: AnalyticsApplicationFact[] = [
    makeFact({
      applicationId: 'a1',
      agentId: 'agent-a',
      effectiveStatus: 'drafting',
      receivedAt: null,
    }),
    makeFact({
      applicationId: 'a2',
      agentId: 'agent-a',
      effectiveStatus: 'pending',
      receivedAt: new Date('2026-01-10T00:00:00.000Z'),
    }),
    makeFact({
      applicationId: 'a3',
      agentId: 'agent-a',
      effectiveStatus: 'issued',
      receivedAt: new Date('2026-01-12T00:00:00.000Z'),
    }),
    makeFact({
      applicationId: 'b1',
      agentId: 'agent-b',
      effectiveStatus: 'booked',
      receivedAt: new Date('2026-02-01T00:00:00.000Z'),
    }),
  ];

  const clients = [
    { agentId: 'agent-a' },
    { agentId: 'agent-a' },
    { agentId: 'agent-a' },
    { agentId: 'agent-b' },
  ];

  it('computes global and per-agent percentages as decimal strings', (): void => {
    const dto = buildAnalyticsDto({
      facts,
      clients,
      agentScopeId: null,
      dateRange: null,
    });

    expect(dto.global.totalApplications).toBe(4);
    const pending = dto.global.byStatus.find((b) => b.status === 'pending');
    expect(pending).toEqual({
      status: 'pending',
      count: 1,
      percentage: '25.00',
    });

    const agentA = dto.perAgent.find((p) => p.agentId === 'agent-a');
    expect(agentA?.totalApplications).toBe(3);
    expect(
      agentA?.byStatus.find((b) => b.status === 'drafting')?.percentage,
    ).toBe('33.33');

    expect(dto.clientsPerAgent).toEqual([
      { agentId: 'agent-a', count: 3, percentage: '75.00' },
      { agentId: 'agent-b', count: 1, percentage: '25.00' },
    ]);
  });

  it('filters status metrics by receivedAt while clients ignore dates', (): void => {
    const dto = buildAnalyticsDto({
      facts,
      clients,
      agentScopeId: null,
      dateRange: {
        from: new Date('2026-01-01T00:00:00.000Z'),
        to: new Date('2026-01-31T23:59:59.999Z'),
      },
    });

    expect(dto.global.totalApplications).toBe(2);
    expect(dto.perAgent.map((p) => p.agentId)).toEqual(['agent-a']);
    expect(dto.clientsPerAgent).toEqual([
      { agentId: 'agent-a', count: 3, percentage: '75.00' },
      { agentId: 'agent-b', count: 1, percentage: '25.00' },
    ]);
  });

  it('scopes all series to a single agent', (): void => {
    const dto = buildAnalyticsDto({
      facts,
      clients,
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
      { agentId: 'agent-b', count: 1, percentage: '100.00' },
    ]);
  });
});
