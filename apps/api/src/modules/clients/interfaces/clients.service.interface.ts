import type {
  ClientDto,
  ClientPortalFormDetailDto,
  ClientsListDto,
} from '@vises/contracts';
import type { User } from '../../database/entities/user.entity';
import type { ClientCreateDto } from '../dto/client-create.dto';
import type { ClientPassportUpdateDto } from '../dto/client-passport-update.dto';
import type { ClientPortalFormUpdateDto } from '../dto/client-portal-form-update.dto';
import type {
  ClientDetailWithPortalFormDto,
  ClientPassportPlainOut,
  ClientsListQueryParsed,
} from '../types';

export interface IClientsService {
  create(body: ClientCreateDto, actor: User): Promise<ClientDto>;

  list(
    actor: User,
    query: ClientsListQueryParsed,
  ): Promise<ClientsListDto>;

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
