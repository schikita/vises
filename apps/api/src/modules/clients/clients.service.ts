import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type {
  ClientDetailDto,
  ClientDto,
  ClientListDto,
  ClientsListDto,
} from '@vises/contracts';
import { DataSource, type EntityManager, In, Repository } from 'typeorm';
import { uid } from '../../shared/utils';
import { BalanceService } from '../balance/balance.service';
import { ApplicationStatusHistory } from '../database/entities/application-status-history.entity';
import { Application } from '../database/entities/application.entity';
import { BalanceTransaction } from '../database/entities/balance-transaction.entity';
import { Client } from '../database/entities/client.entity';
import { User } from '../database/entities/user.entity';
import { PiiCryptoService } from '../pii';
import { SettingsService } from '../settings/settings.service';
import {
  CLIENT_CREATION_DEBIT_REASON,
  PASSPORT_READ_AUDIT_ACTION,
} from './constants';
import type { ClientCreateDto } from './dto/client-create.dto';
import type { ClientPassportUpdateDto } from './dto/client-passport-update.dto';
import type { IClientsService } from './interfaces';
import type { ClientPassportPlainOut, ClientsListQueryParsed } from './types';
import {
  applyEncryptedPassportFields,
  assertAgentCreate,
  assertCanAccessClient,
  buildPassportPlainOut,
  extractPassportCiphertextFields,
  filterClientsListBySearch,
  generateClientAppCode,
  mapClientToDetailDto,
  mapClientToDto,
  mapClientToListDto,
  normalizeRouteCity,
  paginateClientsList,
  parsePricePerClientWholeUnits,
  pickPassportUpdateFields,
  resolveAgentDisplayName,
  sortClientsList,
  throwClientNotFound,
  throwPassportNotUnlocked,
} from './utils';

@Injectable()
export class ClientsService implements IClientsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(Application)
    private readonly applications: Repository<Application>,
    @InjectRepository(BalanceTransaction)
    private readonly ledger: Repository<BalanceTransaction>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly balance: BalanceService,
    private readonly pii: PiiCryptoService,
    private readonly settings: SettingsService,
  ) {}

  async create(body: ClientCreateDto, actor: User): Promise<ClientDto> {
    assertAgentCreate(actor);

    const settingsOut = await this.settings.get();
    const pricePerClient = settingsOut.price_per_client;
    const paymentAmount = parsePricePerClientWholeUnits(pricePerClient);

    return this.dataSource.transaction(
      async (manager: EntityManager): Promise<ClientDto> => {
        const now = new Date();
        const clientId = uid('cli');
        const applicationId = uid('app');

        const client = manager.create(Client, {
          id: clientId,
          agentId: actor.id,
          email: body.email ?? null,
          phone: body.phone ?? null,
          address: body.address ?? null,
          purpose: body.purpose ?? null,
          firstEntry: body.firstEntry ?? null,
          entries: body.entries ?? null,
          durationDays: body.durationDays ?? null,
          relationship: body.relationship ?? null,
          passportNumber: null,
          passportIssued: null,
          passportExpires: null,
          passportType: null,
          passportIssueCountry: null,
          passportIssuedBy: null,
          firstName: null,
          lastName: null,
          lastNameAtBirth: null,
          dob: null,
          placeOfBirth: null,
          countryOfBirth: null,
          nationality: null,
          nationalityAtBirth: null,
          nationalId: null,
          otherNames: null,
          gender: null,
          maritalStatus: null,
          createdAt: now,
          updatedAt: now,
        });
        await manager.save(Client, client);

        const application = manager.create(Application, {
          id: applicationId,
          clientId,
          code: generateClientAppCode(),
          clientEmail: body.email ?? '',
          portalFormEmail: null,
          status: 'drafting',
          paymentAmount,
          paymentPaid: false,
          createdAt: now,
          updatedAt: now,
        });
        await manager.save(Application, application);

        await this.balance.debitWithLock(manager, {
          agentId: actor.id,
          actorId: actor.id,
          amount: pricePerClient,
          clientId,
          reason: CLIENT_CREATION_DEBIT_REASON,
        });

        // Keep ClientDto on create for minimal churn (Decision 2A note).
        return mapClientToDto(client, applicationId);
      },
    );
  }

  async list(
    actor: User,
    query: ClientsListQueryParsed,
  ): Promise<ClientsListDto> {
    const qb = this.clients.createQueryBuilder('c');

    if (actor.role === 'agent') {
      qb.andWhere('c.agent_id = :agentId', { agentId: actor.id });
    }

    const rows = await qb.getMany();
    if (rows.length === 0) {
      return paginateClientsList({
        rows: [],
        page: query.page,
        pageSize: query.pageSize,
      });
    }

    const appByClientId = await this.loadApplicationsByClientId(
      rows.map((row) => row.id),
    );
    const agentById = await this.loadAgentsById(
      rows.map((row): string => row.agentId),
    );

    const mapped: ClientListDto[] = rows.map((row): ClientListDto => {
      const application = appByClientId.get(row.id);
      if (!application) {
        return throwClientNotFound();
      }
      const agent = agentById.get(row.agentId);
      const plaintext = this.pii.decryptFields(
        {
          firstName: row.firstName,
          lastName: row.lastName,
          passportNumber: row.passportNumber,
        },
        {
          actorId: actor.id,
          actorRole: actor.role,
          action: PASSPORT_READ_AUDIT_ACTION,
          clientId: row.id,
        },
      );
      return mapClientToListDto({
        client: row,
        status: application.status,
        firstName: plaintext.firstName ?? null,
        lastName: plaintext.lastName ?? null,
        passportNumber: plaintext.passportNumber ?? null,
        agentName: agent
          ? resolveAgentDisplayName(agent)
          : row.agentId,
        routeFrom: normalizeRouteCity(application.submitCity),
        routeTo: normalizeRouteCity(application.destination),
      });
    });

    const filtered = filterClientsListBySearch(mapped, query.search);
    const sorted = sortClientsList(filtered, query.sortBy, query.sortDir);
    return paginateClientsList({
      rows: sorted,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  async getById(clientId: string, actor: User): Promise<ClientDetailDto> {
    const client = assertCanAccessClient(
      await this.clients.findOne({ where: { id: clientId } }),
      actor,
    );
    const application = await this.requireApplication(client.id);
    const ciphertext = extractPassportCiphertextFields(client);
    const plaintext = this.pii.decryptFields(ciphertext, {
      actorId: actor.id,
      actorRole: actor.role,
      action: PASSPORT_READ_AUDIT_ACTION,
      clientId: client.id,
    });
    return mapClientToDetailDto({
      client,
      applicationId: application.id,
      applicationStatus: application.status,
      plaintext,
    });
  }

  async getPassport(
    clientId: string,
    actor: User,
  ): Promise<ClientPassportPlainOut> {
    const client = assertCanAccessClient(
      await this.clients.findOne({ where: { id: clientId } }),
      actor,
    );
    await this.assertPassportUnlocked(client.id);

    const ciphertext = extractPassportCiphertextFields(client);
    const plaintext = this.pii.decryptFields(ciphertext, {
      actorId: actor.id,
      actorRole: actor.role,
      action: PASSPORT_READ_AUDIT_ACTION,
      clientId: client.id,
    });
    return buildPassportPlainOut(plaintext);
  }

  async updatePassport(
    clientId: string,
    body: ClientPassportUpdateDto,
    actor: User,
  ): Promise<ClientDto> {
    const client = assertCanAccessClient(
      await this.clients.findOne({ where: { id: clientId } }),
      actor,
    );
    await this.assertPassportUnlocked(client.id);

    const plainFields = pickPassportUpdateFields(body);
    const encrypted = this.pii.encryptFields(plainFields);
    applyEncryptedPassportFields(client, encrypted);
    client.updatedAt = new Date();
    await this.clients.save(client);

    const applicationId = await this.requireApplicationId(client.id);
    // Keep ClientDto on passport update for minimal churn (Decision 2A note).
    return mapClientToDto(client, applicationId);
  }

  async remove(clientId: string, actor: User): Promise<{ ok: true }> {
    // ACL: controller @Roles(admin, superadmin). No automatic refund (FR-8 / AC-17).
    void actor;
    const client = await this.clients.findOne({ where: { id: clientId } });
    if (!client) {
      return throwClientNotFound();
    }

    await this.dataSource.transaction(
      async (manager: EntityManager): Promise<void> => {
        const application = await manager.findOne(Application, {
          where: { clientId: client.id },
        });
        if (application) {
          await manager.delete(ApplicationStatusHistory, {
            applicationId: application.id,
          });
          await manager.delete(Application, { id: application.id });
        }
        await manager.delete(Client, { id: client.id });
      },
    );

    return { ok: true };
  }

  private async assertPassportUnlocked(clientId: string): Promise<void> {
    const debit = await this.ledger.findOne({
      where: {
        clientId,
        type: 'client_creation_debit',
      },
    });
    if (!debit) {
      return throwPassportNotUnlocked();
    }
  }

  private async requireApplicationId(clientId: string): Promise<string> {
    const application = await this.requireApplication(clientId);
    return application.id;
  }

  private async requireApplication(clientId: string): Promise<Application> {
    const application = await this.applications.findOne({
      where: { clientId },
    });
    if (!application) {
      return throwClientNotFound();
    }
    return application;
  }

  private async loadApplicationsByClientId(
    clientIds: string[],
  ): Promise<Map<string, Application>> {
    const apps = await this.applications
      .createQueryBuilder('a')
      .where('a.client_id IN (:...clientIds)', { clientIds })
      .getMany();
    const map = new Map<string, Application>();
    for (const app of apps) {
      map.set(app.clientId, app);
    }
    return map;
  }

  private async loadAgentsById(
    agentIds: string[],
  ): Promise<Map<string, User>> {
    const uniqueIds = [...new Set(agentIds.filter((id): boolean => Boolean(id)))];
    if (uniqueIds.length === 0) {
      return new Map();
    }
    const agents = await this.users.find({
      where: { id: In(uniqueIds) },
      select: { id: true, name: true, login: true },
    });
    const map = new Map<string, User>();
    for (const agent of agents) {
      map.set(agent.id, agent);
    }
    return map;
  }
}
