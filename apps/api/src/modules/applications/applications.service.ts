import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type {
  ApplicationDto,
  ApplicationStatusHistoryResponseDto,
} from '@vises/contracts';
import { DataSource, type EntityManager, Repository } from 'typeorm';
import { uid } from '../../shared/utils';
import { ApplicationStatusHistory } from '../database/entities/application-status-history.entity';
import { Application } from '../database/entities/application.entity';
import { Client } from '../database/entities/client.entity';
import {
  VISA_CENTER_MONITOR_ACTOR,
  VISA_CENTER_MONITOR_DEFAULT_TRIGGER,
  VISA_CENTER_MONITOR_REMAP_TARGET,
} from './constants';
import type { ApplicationStatusChangeDto } from './dto/application-status-change.dto';
import type { IApplicationsService } from './interfaces';
import type { ApplyStatusTransitionInput, StaffTransitionActor } from './types';
import {
  assertCanReadApplicationHistory,
  assertMonitorStatusRemapAllowed,
  assertStatusTransitionAllowed,
  lockApplicationForUpdate,
  mapApplicationToDto,
  mapStatusHistoryToDto,
  resolveApplicationOwnerAgentId,
  throwApplicationNotFound,
  toStaffMatrixActor,
} from './utils';

@Injectable()
export class ApplicationsService implements IApplicationsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Application)
    private readonly applications: Repository<Application>,
    @InjectRepository(ApplicationStatusHistory)
    private readonly history: Repository<ApplicationStatusHistory>,
    @InjectRepository(Client)
    private readonly clients: Repository<Client>,
  ) {}

  async changeStatus(
    applicationId: string,
    body: ApplicationStatusChangeDto,
    actor: StaffTransitionActor,
  ): Promise<ApplicationDto> {
    const matrixActor = toStaffMatrixActor(actor.role);

    return this.dataSource.transaction(
      async (manager: EntityManager): Promise<ApplicationDto> => {
        const application = await lockApplicationForUpdate(
          manager,
          applicationId,
        );
        const ownerAgentId = await resolveApplicationOwnerAgentId(
          manager,
          application.clientId,
        );
        const isOwningAgent = ownerAgentId === actor.id;

        assertStatusTransitionAllowed({
          source: application.status,
          target: body.targetStatus,
          actor: matrixActor,
          isOwningAgent,
        });

        return this.applyTransition(manager, {
          application,
          targetStatus: body.targetStatus,
          actorId: actor.id,
          actorRole: matrixActor,
          trigger: body.trigger?.trim() ? body.trigger.trim() : null,
        });
      },
    );
  }

  async markPendingByMonitor(applicationId: string): Promise<ApplicationDto> {
    return this.dataSource.transaction(
      async (manager: EntityManager): Promise<ApplicationDto> => {
        const application = await lockApplicationForUpdate(
          manager,
          applicationId,
        );

        assertMonitorStatusRemapAllowed({ source: application.status });

        return this.applyTransition(manager, {
          application,
          targetStatus: VISA_CENTER_MONITOR_REMAP_TARGET,
          actorId: null,
          actorRole: VISA_CENTER_MONITOR_ACTOR,
          trigger: VISA_CENTER_MONITOR_DEFAULT_TRIGGER,
        });
      },
    );
  }

  async getHistory(
    applicationId: string,
    actor: StaffTransitionActor,
  ): Promise<ApplicationStatusHistoryResponseDto> {
    const application = await this.applications.findOne({
      where: { id: applicationId },
    });
    if (!application) {
      return throwApplicationNotFound();
    }

    const client = await this.clients.findOne({
      where: { id: application.clientId },
    });
    if (!client) {
      return throwApplicationNotFound();
    }

    assertCanReadApplicationHistory({
      actorRole: actor.role,
      actorId: actor.id,
      ownerAgentId: client.agentId,
    });

    const rows = await this.history.find({
      where: { applicationId },
      order: { createdAt: 'ASC' },
    });

    return {
      items: rows.map((row) => mapStatusHistoryToDto(row)),
    };
  }

  private async applyTransition(
    manager: EntityManager,
    input: ApplyStatusTransitionInput,
  ): Promise<ApplicationDto> {
    const now = new Date();
    const fromStatus = input.application.status;

    input.application.status = input.targetStatus;
    input.application.updatedAt = now;
    const saved = await manager.save(Application, input.application);

    const history = manager.create(ApplicationStatusHistory, {
      id: uid('ash'),
      applicationId: saved.id,
      fromStatus,
      toStatus: input.targetStatus,
      actorId: input.actorId,
      actorRole: input.actorRole,
      trigger: input.trigger,
      createdAt: now,
    });
    await manager.save(ApplicationStatusHistory, history);

    return mapApplicationToDto(saved);
  }
}
