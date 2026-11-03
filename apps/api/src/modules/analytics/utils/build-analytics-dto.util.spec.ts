import type {
  AnalyticsAgentLookup,
  AnalyticsApplicationFact,
} from '../types';
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

const defaultPagination = { page: 1, pageSize: 20 };
const emptyAgents = new Map();

describe('buildAnalyticsDto (AC-15 / AC-15a / AC-15b / §6.7.1 / DEC-P2 / DEC-P15)', (): void => {
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
      pagination: defaultPagination,
      agentQ: '',
      agentsById: emptyAgents,
    });

    expect(dto.global.totalApplications).toBe(4);
    const pending = dto.global.byStatus.find((b) => b.status === 'pending');
    expect(pending).toEqual({
      status: 'pending',
      count: 1,
      percentage: '25.00',
    });

    const agentA = dto.perAgent.items.find((p) => p.agentId === 'agent-a');
    expect(agentA?.totalApplications).toBe(3);
    expect(
      agentA?.byStatus.find((b) => b.status === 'drafting')?.percentage,
    ).toBe('33.33');

    expect(dto.clientsPerAgent).toEqual([
      { agentId: 'agent-a', count: 3, percentage: '75.00' },
      { agentId: 'agent-b', count: 1, percentage: '25.00' },
    ]);
    expect(dto.perAgent).toMatchObject({
      total: 2,
      page: 1,
      pageSize: 20,
    });
  });

  it('sorts perAgent by client count descending with agentId tie-break', (): void => {
    const dto = buildAnalyticsDto({
      facts: [
        ...facts,
        makeFact({
          applicationId: 'c1',
          agentId: 'agent-c',
          effectiveStatus: 'pending',
          receivedAt: new Date('2026-03-01T00:00:00.000Z'),
        }),
      ],
      clients: [
        { agentId: 'agent-b' },
        { agentId: 'agent-b' },
        { agentId: 'agent-b' },
        { agentId: 'agent-b' },
        { agentId: 'agent-a' },
        { agentId: 'agent-c' },
        { agentId: 'agent-c' },
      ],
      agentScopeId: null,
      dateRange: null,
      pagination: defaultPagination,
      agentQ: '',
      agentsById: emptyAgents,
    });

    expect(dto.perAgent.items.map((p) => p.agentId)).toEqual([
      'agent-b',
      'agent-c',
      'agent-a',
    ]);
  });

  it('paginates only perAgent and respects pageSize strictly', (): void => {
    const dto = buildAnalyticsDto({
      facts,
      clients,
      agentScopeId: null,
      dateRange: null,
      pagination: { page: 2, pageSize: 1 },
      agentQ: '',
      agentsById: emptyAgents,
    });

    expect(dto.perAgent).toEqual({
      items: [
        expect.objectContaining({ agentId: 'agent-b' }),
      ],
      total: 2,
      page: 2,
      pageSize: 1,
    });
    expect(dto.perAgent.items.length).toBeLessThanOrEqual(1);
    expect(dto.global.totalApplications).toBe(4);
    expect(dto.clientsPerAgent).toHaveLength(2);
  });

  it('limits perAgent.items to pageSize=5 (T23 / DEC-P14)', (): void => {
    const manyFacts = Array.from({ length: 8 }, (_, i) =>
      makeFact({
        applicationId: `x${i}`,
        agentId: `agent-${i}`,
        effectiveStatus: 'pending',
        receivedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );
    const manyClients = manyFacts.map((f) => ({ agentId: f.agentId }));
    const dto = buildAnalyticsDto({
      facts: manyFacts,
      clients: manyClients,
      agentScopeId: null,
      dateRange: null,
      pagination: { page: 1, pageSize: 5 },
      agentQ: '',
      agentsById: emptyAgents,
    });

    expect(dto.perAgent.items.length).toBe(Math.min(5, dto.perAgent.total));
    expect(dto.perAgent.items.length).toBe(5);
    expect(dto.perAgent.total).toBe(8);
    expect(dto.perAgent.page).toBe(1);
    expect(dto.perAgent.pageSize).toBe(5);
    expect(dto.clientsPerAgent).toHaveLength(8);
  });

  it('returns fewer than pageSize when filtered total is smaller (T23)', (): void => {
    const dto = buildAnalyticsDto({
      facts,
      clients,
      agentScopeId: null,
      dateRange: null,
      pagination: { page: 1, pageSize: 5 },
      agentQ: '',
      agentsById: emptyAgents,
    });

    expect(dto.perAgent.total).toBe(2);
    expect(dto.perAgent.items.length).toBe(Math.min(5, 2));
    expect(dto.perAgent.page).toBe(1);
    expect(dto.perAgent.pageSize).toBe(5);
  });

  it('filters perAgent by q without affecting clientsPerAgent/global', (): void => {
    const agentsById = new Map([
      [
        'agent-a',
        { id: 'agent-a', login: 'alice', name: 'Alice Agent' },
      ],
      [
        'agent-b',
        { id: 'agent-b', login: 'bob', name: 'Bob Agent' },
      ],
    ]);
    const dto = buildAnalyticsDto({
      facts,
      clients,
      agentScopeId: null,
      dateRange: null,
      pagination: defaultPagination,
      agentQ: 'bob',
      agentsById,
    });

    expect(dto.perAgent.items.map((p) => p.agentId)).toEqual(['agent-b']);
    expect(dto.perAgent.total).toBe(1);
    expect(dto.global.totalApplications).toBe(4);
    expect(dto.clientsPerAgent).toHaveLength(2);
  });

  it('filters by q then paginates with page offset (T23 / DEC-P15)', (): void => {
    const manyFacts = Array.from({ length: 6 }, (_, i) =>
      makeFact({
        applicationId: `m${i}`,
        agentId: `match-${i}`,
        effectiveStatus: 'pending',
        receivedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    ).concat([
      makeFact({
        applicationId: 'other-1',
        agentId: 'other-agent',
        effectiveStatus: 'pending',
        receivedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    ]);
    const manyClients = [
      ...Array.from({ length: 6 }, (_, i) => ({
        agentId: `match-${i}`,
      })),
      { agentId: 'other-agent' },
      { agentId: 'other-agent' },
      { agentId: 'other-agent' },
    ];
    const agentsById = new Map<string, AnalyticsAgentLookup>(
      Array.from({ length: 6 }, (_, i) => {
        const id = `match-${i}`;
        return [
          id,
          { id, login: `login-${i}`, name: `Match Agent ${i}` },
        ] as [string, AnalyticsAgentLookup];
      }),
    );
    agentsById.set('other-agent', {
      id: 'other-agent',
      login: 'other',
      name: 'Other Agent',
    });

    const dto = buildAnalyticsDto({
      facts: manyFacts,
      clients: manyClients,
      agentScopeId: null,
      dateRange: null,
      pagination: { page: 2, pageSize: 2 },
      agentQ: 'match',
      agentsById,
    });

    expect(dto.perAgent.total).toBe(6);
    expect(dto.perAgent.page).toBe(2);
    expect(dto.perAgent.pageSize).toBe(2);
    expect(dto.perAgent.items).toHaveLength(2);
    expect(dto.perAgent.items.map((p) => p.agentId)).toEqual([
      'match-2',
      'match-3',
    ]);
    expect(dto.clientsPerAgent).toHaveLength(7);
    expect(dto.global.totalApplications).toBe(7);
  });

  it('matches q against agent id, login, and name case-insensitively', (): void => {
    const agentsById = new Map([
      [
        'agent-a',
        { id: 'agent-a', login: 'alice', name: 'Alice Agent' },
      ],
      [
        'agent-b',
        { id: 'agent-b', login: 'bob', name: 'Bob Agent' },
      ],
    ]);

    const byId = buildAnalyticsDto({
      facts,
      clients,
      agentScopeId: null,
      dateRange: null,
      pagination: defaultPagination,
      agentQ: 'AGENT-B',
      agentsById,
    });
    expect(byId.perAgent.items.map((p) => p.agentId)).toEqual(['agent-b']);
    expect(byId.perAgent.total).toBe(1);

    const byName = buildAnalyticsDto({
      facts,
      clients,
      agentScopeId: null,
      dateRange: null,
      pagination: defaultPagination,
      agentQ: 'alice agent',
      agentsById,
    });
    expect(byName.perAgent.items.map((p) => p.agentId)).toEqual(['agent-a']);
    expect(byName.perAgent.total).toBe(1);
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
      pagination: defaultPagination,
      agentQ: '',
      agentsById: emptyAgents,
    });

    expect(dto.global.totalApplications).toBe(2);
    expect(dto.perAgent.items.map((p) => p.agentId)).toEqual(['agent-a']);
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
      pagination: defaultPagination,
      agentQ: '',
      agentsById: emptyAgents,
    });

    expect(dto.perAgent.items).toHaveLength(1);
    const scopedAgent = dto.perAgent.items[0];
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
