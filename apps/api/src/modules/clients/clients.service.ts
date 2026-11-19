import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type {
  ClientDto,
  ClientListDto,
  ClientPortalFormDetailDto,
} from '@vises/contracts';
import { DataSource, type EntityManager, Repository } from 'typeorm';
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
import type { ClientPortalFormUpdateDto } from './dto/client-portal-form-update.dto';
import type { IClientsService } from './interfaces';
import type {
  ClientDetailWithPortalFormDto,
  ClientPassportPlainOut,
  CreateClientWithDebitInput,
} from './types';
import {
  applyEncryptedPassportFields,
  applyPortalFormFields,
  assertAgentCreate,
  assertCanAccessClient,
  isOfficeStaffRole,
  buildNewClientRow,
  buildPassportPlainOut,
  extractPassportCiphertextFields,
  generateClientAppCode,
  mapClientToDetailDto,
  mapClientToDto,
  mapClientToListDto,
  mapClientToPortalFormDetailDto,
  parsePricePerClientWholeUnits,
  pickMostRecentlyUpdatedApplication,
  pickPassportUpdateFields,
  pickPortalFormUpdateFields,
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
        const client = await this.insertClientAndDebit(
          manager,
          actor,
          body,
          pricePerClient,
        );
        const now = client.createdAt;
        const applicationId = uid('app');

        const application = manager.create(Application, {
          id: applicationId,
          clientId: client.id,
          code: generateClientAppCode(),
          clientEmail: body.email ?? '',
          portalFormEmail: null,
          status: 'draft',
          paymentAmount,
          paymentPaid: false,
          createdAt: now,
          updatedAt: now,
        });
        await manager.save(Application, application);

        // Keep ClientDto on create for minimal churn (Decision 2A note).
        return mapClientToDto(client, applicationId);
      },
    );
  }

  /**
   * Create CRM Client + ledger debit only (no Application).
   * Used by staff apps upsert when `clientId` is absent (DEC-PF-011).
   */
  async createClientWithDebit(
    actor: User,
    fields: CreateClientWithDebitInput = {},
  ): Promise<Client> {
    const settingsOut = await this.settings.get();
    const pricePerClient = settingsOut.price_per_client;

    return this.dataSource.transaction(
      async (manager: EntityManager): Promise<Client> =>
        this.insertClientAndDebit(manager, actor, fields, pricePerClient),
    );
  }

  async findClientById(clientId: string): Promise<Client | null> {
    return this.clients.findOne({ where: { id: clientId } });
  }

  async list(actor: User): Promise<ClientListDto[]> {
    const qb = this.clients
      .createQueryBuilder('c')
      .orderBy('c.created_at', 'DESC');

    if (actor.role === 'agent') {
      qb.andWhere('c.agent_id = :agentId', { agentId: actor.id });
    }

    const rows = await qb.getMany();
    if (rows.length === 0) {
      return [];
    }

    const appByClientId = await this.loadApplicationsByClientId(
      rows.map((row) => row.id),
    );

    return rows.map((row): ClientListDto => {
      const application = appByClientId.get(row.id);
      if (!application) {
        return throwClientNotFound();
      }
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
      });
    });
  }

  async getById(
    clientId: string,
    actor: User,
  ): Promise<ClientDetailWithPortalFormDto> {
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
    return {
      ...mapClientToDetailDto({
        client,
        applicationId: application.id,
        applicationStatus: application.status,
        plaintext,
      }),
      ...mapClientToPortalFormDetailDto(client),
    };
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

  /**
   * Persist portal-form Client columns (REQ-004).
   * No passport unlock / debit ledger gate (DEC-002 vs FR-6).
   */
  async updatePortalForm(
    clientId: string,
    body: ClientPortalFormUpdateDto,
    actor: User,
  ): Promise<ClientPortalFormDetailDto> {
    const client = assertCanAccessClient(
      await this.clients.findOne({ where: { id: clientId } }),
      actor,
    );

    const fields = pickPortalFormUpdateFields(body);
    applyPortalFormFields(client, fields);
    client.updatedAt = new Date();
    await this.clients.save(client);

    return mapClientToPortalFormDetailDto(client);
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
        const applications = await manager.find(Application, {
          where: { clientId: client.id },
        });
        for (const application of applications) {
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

  private async insertClientAndDebit(
    manager: EntityManager,
    actor: User,
    fields: CreateClientWithDebitInput,
    pricePerClient: string,
  ): Promise<Client> {
    const now = new Date();
    const clientId = uid('cli');
    const client = buildNewClientRow({
      id: clientId,
      agentId: actor.id,
      email: fields.email ?? null,
      phone: fields.phone ?? null,
      address: fields.address ?? null,
      purpose: fields.purpose ?? null,
      firstEntry: fields.firstEntry ?? null,
      entries: fields.entries ?? null,
      durationDays: fields.durationDays ?? null,
      relationship: fields.relationship ?? null,
      now,
    });
    await manager.save(Client, client);

    if (isOfficeStaffRole(actor.role)) {
      await manager.save(
        BalanceTransaction,
        manager.create(BalanceTransaction, {
          id: uid('btx'),
          agentId: actor.id,
          actorId: actor.id,
          type: 'client_creation_debit',
          amount: '0.00',
          reason: CLIENT_CREATION_DEBIT_REASON,
          resultingBalance: '0.00',
          clientId,
          createdAt: now,
        }),
      );
      return client;
    }

    await this.balance.debitWithLock(manager, {
      agentId: actor.id,
      actorId: actor.id,
      amount: pricePerClient,
      clientId,
      reason: CLIENT_CREATION_DEBIT_REASON,
    });

    return client;
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

  /** Prefer most recently updated Application when Client has many (DEC-PF-011). */
  private async requireApplication(clientId: string): Promise<Application> {
    const application = await this.applications.findOne({
      where: { clientId },
      order: { updatedAt: 'DESC' },
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
      .orderBy('a.updated_at', 'DESC')
      .getMany();
    const map = new Map<string, Application>();
    for (const app of apps) {
      map.set(
        app.clientId,
        pickMostRecentlyUpdatedApplication(map.get(app.clientId), app),
      );
    }
    return map;
  }
}
