import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { AnalyticsDto } from '@vises/contracts';
import { In, Repository } from 'typeorm';
import { ApplicationStatusHistory } from '../database/entities/application-status-history.entity';
import { Application } from '../database/entities/application.entity';
import { Client } from '../database/entities/client.entity';
import { User } from '../database/entities/user.entity';
import type { IAnalyticsService } from './interfaces';
import type {
  AnalyticsAgentLookup,
  AnalyticsAppOwnerRow,
  AnalyticsDateRange,
  AnalyticsPagination,
} from './types';
import {
  buildAnalyticsApplicationFacts,
  buildAnalyticsDto,
  mapClientRowToAgent,
  mapHistoryRowToEvent,
  resolveAnalyticsAgentScopeId,
} from './utils';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
  constructor(
    @InjectRepository(Application)
    private readonly applications: Repository<Application>,
    @InjectRepository(Client)
    private readonly clients: Repository<Client>,
    @InjectRepository(ApplicationStatusHistory)
    private readonly history: Repository<ApplicationStatusHistory>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async getRolesApplications(
    actor: User,
    dateRange: AnalyticsDateRange | null,
    pagination: AnalyticsPagination,
    agentQ: string,
  ): Promise<AnalyticsDto> {
    const agentScopeId = resolveAnalyticsAgentScopeId(actor);

    const owners: AnalyticsAppOwnerRow[] = await this.applications
      .createQueryBuilder('app')
      .innerJoin(Client, 'client', 'client.id = app.client_id')
      .select('app.id', 'applicationId')
      .addSelect('client.agent_id', 'agentId')
      .getRawMany<AnalyticsAppOwnerRow>();

    const historyRows = await this.history.find({
      select: {
        applicationId: true,
        fromStatus: true,
        toStatus: true,
        createdAt: true,
      },
      order: { createdAt: 'ASC' },
    });

    const clientRows = await this.clients.find({
      select: { agentId: true },
    });

    const facts = buildAnalyticsApplicationFacts(
      owners,
      historyRows.map(mapHistoryRowToEvent),
    );

    const agentsById = await this.loadAgentsByIdForQ(
      agentQ,
      facts.map((fact): string => fact.agentId),
      agentScopeId,
    );

    return buildAnalyticsDto({
      facts,
      clients: clientRows.map(mapClientRowToAgent),
      agentScopeId,
      dateRange,
      pagination,
      agentQ,
      agentsById,
    });
  }

  private async loadAgentsByIdForQ(
    agentQ: string,
    agentIds: string[],
    agentScopeId: string | null,
  ): Promise<Map<string, AnalyticsAgentLookup>> {
    if (agentQ.trim() === '') {
      return new Map();
    }

    const uniqueIds = [
      ...new Set(
        agentIds.filter((id): boolean => {
          if (!id) {
            return false;
          }
          if (agentScopeId !== null && id !== agentScopeId) {
            return false;
          }
          return true;
        }),
      ),
    ];
    if (uniqueIds.length === 0) {
      return new Map();
    }

    const rows = await this.users.find({
      where: { id: In(uniqueIds) },
      select: { id: true, login: true, name: true },
    });

    const map = new Map<string, AnalyticsAgentLookup>();
    for (const row of rows) {
      map.set(row.id, {
        id: row.id,
        login: row.login,
        name: row.name,
      });
    }
    return map;
  }
}
