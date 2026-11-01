import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { AnalyticsDto } from '@vises/contracts';
import { Repository } from 'typeorm';
import { ApplicationStatusHistory } from '../database/entities/application-status-history.entity';
import { Application } from '../database/entities/application.entity';
import { Client } from '../database/entities/client.entity';
import { User } from '../database/entities/user.entity';
import type { IAnalyticsService } from './interfaces';
import type { AnalyticsAppOwnerRow, AnalyticsDateRange } from './types';
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
  ) {}

  async getRolesApplications(
    actor: User,
    dateRange: AnalyticsDateRange | null,
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

    return buildAnalyticsDto({
      facts,
      clients: clientRows.map(mapClientRowToAgent),
      agentScopeId,
      dateRange,
    });
  }
}
