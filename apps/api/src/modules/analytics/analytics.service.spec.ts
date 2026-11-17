import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApplicationStatusHistory } from '../database/entities/application-status-history.entity';
import { Application } from '../database/entities/application.entity';
import { Client } from '../database/entities/client.entity';
import { User } from '../database/entities/user.entity';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService (AC-15 / AC-16 / FR-9 / DEC-P15 / DEC-ASAU-003 / DEC-ASAU-009)', (): void => {
  type QbStub = {
    innerJoin: jest.Mock;
    select: jest.Mock;
    addSelect: jest.Mock;
    getRawMany: jest.Mock;
  };

  const createQb = (rows: unknown[]): QbStub => {
    const qb: QbStub = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(async (): Promise<unknown[]> => rows),
    };
    return qb;
  };

  let appsQb: QbStub;
  let historyFind: jest.Mock;
  let clientsFind: jest.Mock;
  let usersFind: jest.Mock;
  let service: AnalyticsService;

  const admin: User = Object.assign(new User(), {
    id: 'admin-1',
    role: 'admin' as const,
  });

  const agent: User = Object.assign(new User(), {
    id: 'agent-a',
    role: 'agent' as const,
  });

  const owners = [
    {
      applicationId: 'app-1',
      agentId: 'agent-a',
      paymentPaid: true,
      paymentAmount: 200,
      submitCity: 'Moscow',
      visitDate: '2026-01-15',
      createdAt: new Date('2026-01-10T00:00:00.000Z'),
    },
    {
      applicationId: 'app-2',
      agentId: 'agent-a',
      paymentPaid: false,
      paymentAmount: 180,
      submitCity: 'Kazan',
      visitDate: '',
      createdAt: new Date('2026-01-12T00:00:00.000Z'),
    },
    {
      applicationId: 'app-3',
      agentId: 'agent-b',
      paymentPaid: false,
      paymentAmount: 180,
      submitCity: 'Moscow',
      visitDate: '',
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
    },
  ];

  const historyRows = [
    {
      applicationId: 'app-1',
      fromStatus: 'draft' as const,
      toStatus: 'not_ready_for_appointment' as const,
      createdAt: new Date('2026-01-10T00:00:00.000Z'),
    },
    {
      applicationId: 'app-1',
      fromStatus: 'not_ready_for_appointment' as const,
      toStatus: 'ready_for_appointment' as const,
      createdAt: new Date('2026-01-10T12:00:00.000Z'),
    },
    {
      applicationId: 'app-1',
      fromStatus: 'ready_for_appointment' as const,
      toStatus: 'booked' as const,
      createdAt: new Date('2026-01-11T00:00:00.000Z'),
    },
    {
      applicationId: 'app-3',
      fromStatus: 'draft' as const,
      toStatus: 'not_ready_for_appointment' as const,
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
    },
  ];

  const clientRows = [
    { agentId: 'agent-a' },
    { agentId: 'agent-a' },
    { agentId: 'agent-b' },
  ];

  const agentBalanceRows = [
    { id: 'agent-a', balance: '99.00' },
    { id: 'agent-b', balance: '10.00' },
  ];

  const agentLookupRows = [
    { id: 'agent-a', login: 'alice', name: 'Alice Agent' },
    { id: 'agent-b', login: 'bob', name: 'Bob Agent' },
  ];

  beforeEach(async (): Promise<void> => {
    appsQb = createQb(owners);
    historyFind = jest.fn(async (): Promise<typeof historyRows> => historyRows);
    clientsFind = jest.fn(async (): Promise<typeof clientRows> => clientRows);
    usersFind = jest.fn(
      async (opts?: {
        select?: { balance?: boolean; login?: boolean; name?: boolean };
      }): Promise<unknown[]> => {
        if (opts?.select?.login === true || opts?.select?.name === true) {
          return agentLookupRows;
        }
        return agentBalanceRows;
      },
    );

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Application),
          useValue: {
            createQueryBuilder: jest.fn((): QbStub => appsQb),
          },
        },
        {
          provide: getRepositoryToken(ApplicationStatusHistory),
          useValue: { find: historyFind },
        },
        {
          provide: getRepositoryToken(Client),
          useValue: { find: clientsFind },
        },
        {
          provide: getRepositoryToken(User),
          useValue: { find: usersFind },
        },
      ],
    }).compile();

    service = moduleRef.get(AnalyticsService);
  });

  const defaultPagination = { page: 1, pageSize: 20 };

  it('returns full aggregates for admin (current totals)', async (): Promise<void> => {
    const dto = await service.getRolesApplications(
      admin,
      null,
      defaultPagination,
      '',
    );

    expect(dto.global.totalApplications).toBe(3);
    // app-2 has no history → draft; app-1 booked; app-3 not_ready_for_appointment
    expect(dto.global.byStatus.find((b) => b.status === 'draft')?.count).toBe(
      1,
    );
    expect(
      dto.global.byStatus.find((b) => b.status === 'booked')?.count,
    ).toBe(1);
    expect(
      dto.global.byStatus.find(
        (b) => b.status === 'not_ready_for_appointment',
      )?.count,
    ).toBe(1);
    expect(dto.global.byStatus.map((b) => b.status)).toEqual([
      'filling',
      'draft',
      'not_ready_for_appointment',
      'ready_for_appointment',
      'booked',
      'declined',
    ]);
    expect(dto.clientsPerAgent).toEqual([
      {
        agentId: 'agent-a',
        count: 2,
        percentage: '66.67',
        balance: '99.00',
        registered: 2,
        paid: 1,
        paidAmount: '200.00',
      },
      {
        agentId: 'agent-b',
        count: 1,
        percentage: '33.33',
        balance: '10.00',
        registered: 1,
        paid: 0,
        paidAmount: '0.00',
      },
    ]);
    expect(dto.bookedVsUnpaid).toEqual({
      bookedCount: 1,
      unpaidCount: 2,
    });
    expect(dto.cityDistribution).toEqual([
      { city: 'Kazan', count: 1, percentage: '33.33' },
      { city: 'Moscow', count: 2, percentage: '66.67' },
    ]);
    expect(dto.paymentCompleteness).toEqual({
      totalApplications: 3,
      paidCount: 1,
      completenessPercentage: '33.33',
    });
    expect(dto.paidVolumeByAgent).toEqual([
      { agentId: 'agent-a', paidAmount: '200.00', paidCount: 1 },
    ]);
    expect(dto.perAgent.total).toBe(2);
    expect(dto.perAgent.page).toBe(1);
    expect(dto.perAgent.pageSize).toBe(20);
    expect(usersFind).toHaveBeenCalledWith({
      where: { role: 'agent' },
      select: { id: true, balance: true },
    });
  });

  it('scopes response for agent actors (self subset, own balance only)', async (): Promise<void> => {
    usersFind.mockImplementation(
      async (): Promise<Array<{ id: string; balance: string }>> => [
        { id: 'agent-a', balance: '99.00' },
      ],
    );

    const dto = await service.getRolesApplications(
      agent,
      null,
      defaultPagination,
      '',
    );

    expect(dto.perAgent.items.every((p) => p.agentId === 'agent-a')).toBe(
      true,
    );
    expect(dto.global.totalApplications).toBe(2);
    expect(dto.clientsPerAgent).toEqual([
      {
        agentId: 'agent-a',
        count: 2,
        percentage: '100.00',
        balance: '99.00',
        registered: 2,
        paid: 1,
        paidAmount: '200.00',
      },
    ]);
    expect(
      dto.clientsPerAgent.every((row) => row.agentId === 'agent-a'),
    ).toBe(true);
    expect(dto.paidVolumeByAgent.every((row) => row.agentId === 'agent-a')).toBe(
      true,
    );
    expect(usersFind).toHaveBeenCalledWith({
      where: { id: 'agent-a' },
      select: { id: true, balance: true },
    });
  });

  it('filters status metrics by createdAt range', async (): Promise<void> => {
    const dto = await service.getRolesApplications(
      admin,
      {
        from: new Date('2026-01-01T00:00:00.000Z'),
        to: new Date('2026-01-31T23:59:59.999Z'),
      },
      defaultPagination,
      '',
    );

    // app-1 + app-2 created in January (includes draft without booked)
    expect(dto.global.totalApplications).toBe(2);
    expect(
      dto.global.byStatus.find((b) => b.status === 'booked')?.count,
    ).toBe(1);
    expect(
      dto.global.byStatus.find((b) => b.status === 'draft')?.count,
    ).toBe(1);
    expect(dto.paymentCompleteness).toEqual({
      totalApplications: 2,
      paidCount: 1,
      completenessPercentage: '50.00',
    });
  });

  it('filters perAgent by q and loads agent lookup (DEC-P15)', async (): Promise<void> => {
    const dto = await service.getRolesApplications(
      admin,
      null,
      { page: 1, pageSize: 5 },
      'bob',
    );

    expect(usersFind).toHaveBeenCalled();
    expect(dto.perAgent.items.map((p) => p.agentId)).toEqual(['agent-b']);
    expect(dto.perAgent.items.length).toBe(Math.min(5, dto.perAgent.total));
    expect(dto.perAgent.total).toBe(1);
    expect(dto.perAgent.page).toBe(1);
    expect(dto.perAgent.pageSize).toBe(5);
    expect(dto.clientsPerAgent).toHaveLength(2);
    expect(dto.global.totalApplications).toBe(3);
  });

  it('paginates perAgent strictly for pageSize=5 (T23)', async (): Promise<void> => {
    const manyOwners = Array.from({ length: 8 }, (_, i) => ({
      applicationId: `app-x${i}`,
      agentId: `agent-${i}`,
      paymentPaid: false,
      paymentAmount: 0,
      submitCity: '',
      visitDate: '',
      createdAt: new Date('2026-01-10T00:00:00.000Z'),
    }));
    appsQb = createQb(manyOwners);
    historyFind.mockResolvedValue(
      manyOwners.map((row) => ({
        applicationId: row.applicationId,
        fromStatus: 'draft' as const,
        toStatus: 'not_ready_for_appointment' as const,
        createdAt: new Date('2026-01-10T00:00:00.000Z'),
      })),
    );
    clientsFind.mockResolvedValue(
      manyOwners.map((row) => ({ agentId: row.agentId })),
    );

    const dto = await service.getRolesApplications(
      admin,
      null,
      { page: 1, pageSize: 5 },
      '',
    );

    expect(dto.perAgent.items.length).toBe(5);
    expect(dto.perAgent.total).toBe(8);
    expect(dto.perAgent.page).toBe(1);
    expect(dto.perAgent.pageSize).toBe(5);
    expect(dto.clientsPerAgent).toHaveLength(8);
  });
});
