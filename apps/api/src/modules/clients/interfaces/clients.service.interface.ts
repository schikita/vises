import type {
  ClientDto,
  ClientListDto,
  ClientPortalFormDetailDto,
} from '@vises/contracts';
import type { User } from '../../database/entities/user.entity';
import type { ClientCreateDto } from '../dto/client-create.dto';
import type { ClientPassportUpdateDto } from '../dto/client-passport-update.dto';
import type { ClientPortalFormUpdateDto } from '../dto/client-portal-form-update.dto';
import type { Client } from '../../database/entities/client.entity';
import type {
  ClientDetailWithPortalFormDto,
  ClientPassportPlainOut,
  CreateClientWithDebitInput,
} from '../types';

export interface IClientsService {
  create(body: ClientCreateDto, actor: User): Promise<ClientDto>;

  /**
   * Create CRM Client + `client_creation_debit` without an Application
   * (DEC-PF-011 — staff apps upsert when `clientId` absent).
   */
  createClientWithDebit(
    actor: User,
    fields?: CreateClientWithDebitInput,
  ): Promise<Client>;

  findClientById(clientId: string): Promise<Client | null>;

  list(actor: User): Promise<ClientListDto[]>;

  getById(
    clientId: string,
    actor: User,
  ): Promise<ClientDetailWithPortalFormDto>;

  getPassport(
    clientId: string,
    actor: User,
  ): Promise<ClientPassportPlainOut>;

  updatePassport(
    clientId: string,
    body: ClientPassportUpdateDto,
    actor: User,
  ): Promise<ClientDto>;

  updatePortalForm(
    clientId: string,
    body: ClientPortalFormUpdateDto,
    actor: User,
  ): Promise<ClientPortalFormDetailDto>;

  remove(clientId: string, actor: User): Promise<{ ok: true }>;
}
