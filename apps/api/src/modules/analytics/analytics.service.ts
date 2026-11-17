import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { AnalyticsDto } from '@vises/contracts';
import { Repository } from 'typeorm';
import { ApplicationStatusHistory } from '../database/entities/application-status-history.entity';
import { Application } from '../database/entities/application.entity';
import { Client } from '../database/entities/client.entity';
import { User } from '../database/entities/user.entity';
import type { IAnalyticsService } from './interfaces';
import type { AnalyticsAppOwnerRawRow, AnalyticsDateRange } from './types';
import {
  buildAnalyticsApplicationFacts,
  buildAnalyticsDto,
  mapAppOwnerRow,
  mapClientRowToAgent,
  mapHistoryRowToEvent,
  mapUserToAgentBalance,
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
  ): Promise<AnalyticsDto> {
    const agentScopeId = resolveAnalyticsAgentScopeId(actor);

    const ownerRaws: AnalyticsAppOwnerRawRow[] = await this.applications
      .createQueryBuilder('app')
      .innerJoin(Client, 'client', 'client.id = app.client_id')
      .select('app.id', 'applicationId')
      .addSelect('client.agent_id', 'agentId')
      .addSelect('app.payment_paid', 'paymentPaid')
      .addSelect('app.payment_amount', 'paymentAmount')
      .addSelect('app.submit_city', 'submitCity')
      .addSelect('app.visit_date', 'visitDate')
      .addSelect('app.created_at', 'createdAt')
      .getRawMany<AnalyticsAppOwnerRawRow>();

    const owners = ownerRaws.map(mapAppOwnerRow);

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

    const agentUserRows =
      agentScopeId === null
        ? await this.users.find({
            where: { role: 'agent' },
            select: { id: true, balance: true },
          })
        : await this.users.find({
            where: { id: agentScopeId },
            select: { id: true, balance: true },
          });

    const facts = buildAnalyticsApplicationFacts(
      owners,
      historyRows.map(mapHistoryRowToEvent),
    );

    return buildAnalyticsDto({
      facts,
      clients: clientRows.map(mapClientRowToAgent),
      agentBalances: agentUserRows.map(mapUserToAgentBalance),
      agentScopeId,
      dateRange,
    });
  }
}
