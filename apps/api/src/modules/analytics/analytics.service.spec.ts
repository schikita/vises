import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApplicationStatusHistory } from '../database/entities/application-status-history.entity';
import { Application } from '../database/entities/application.entity';
import { Client } from '../database/entities/client.entity';
import { User } from '../database/entities/user.entity';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService (AC-15 / AC-16 / FR-9)', (): void => {
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
    { applicationId: 'app-1', agentId: 'agent-a' },
    { applicationId: 'app-2', agentId: 'agent-a' },
    { applicationId: 'app-3', agentId: 'agent-b' },
  ];

  const historyRows = [
    {
      applicationId: 'app-1',
      fromStatus: 'drafting' as const,
      toStatus: 'pending' as const,
      createdAt: new Date('2026-01-10T00:00:00.000Z'),
    },
    {
      applicationId: 'app-1',
      fromStatus: 'pending' as const,
      toStatus: 'booked' as const,
      createdAt: new Date('2026-01-11T00:00:00.000Z'),
    },
    {
      applicationId: 'app-3',
      fromStatus: 'drafting' as const,
      toStatus: 'pending' as const,
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
    },
  ];

  const clientRows = [
    { agentId: 'agent-a' },
    { agentId: 'agent-a' },
    { agentId: 'agent-b' },
  ];

  beforeEach(async (): Promise<void> => {
    appsQb = createQb(owners);
    historyFind = jest.fn(async (): Promise<typeof historyRows> => historyRows);
    clientsFind = jest.fn(async (): Promise<typeof clientRows> => clientRows);

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
      ],
    }).compile();

    service = moduleRef.get(AnalyticsService);
  });

  it('returns full aggregates for admin (current totals)', async (): Promise<void> => {
    const dto = await service.getRolesApplications(admin, null);

    expect(dto.global.totalApplications).toBe(3);
    // app-2 has no history → drafting; app-1 booked; app-3 pending
    expect(
      dto.global.byStatus.find((b) => b.status === 'drafting')?.count,
    ).toBe(1);
    expect(
      dto.global.byStatus.find((b) => b.status === 'booked')?.count,
    ).toBe(1);
    expect(
      dto.global.byStatus.find((b) => b.status === 'pending')?.count,
    ).toBe(1);
    expect(dto.clientsPerAgent).toEqual([
      { agentId: 'agent-a', count: 2, percentage: '66.67' },
      { agentId: 'agent-b', count: 1, percentage: '33.33' },
    ]);
  });

  it('scopes response for agent actors (self subset)', async (): Promise<void> => {
    const dto = await service.getRolesApplications(agent, null);

    expect(dto.perAgent.every((p) => p.agentId === 'agent-a')).toBe(true);
    expect(dto.global.totalApplications).toBe(2);
    expect(dto.clientsPerAgent).toEqual([
      { agentId: 'agent-a', count: 2, percentage: '100.00' },
    ]);
  });

  it('filters status metrics by receivedAt range', async (): Promise<void> => {
    const dto = await service.getRolesApplications(admin, {
      from: new Date('2026-01-01T00:00:00.000Z'),
      to: new Date('2026-01-31T23:59:59.999Z'),
    });

    // Only app-1 received in January (app-2 never; app-3 in February)
    expect(dto.global.totalApplications).toBe(1);
    expect(
      dto.global.byStatus.find((b) => b.status === 'booked')?.count,
    ).toBe(1);
  });
});
