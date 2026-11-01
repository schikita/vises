import type {
  ClientDetailDto,
  ClientDto,
  ClientListDto,
} from '@vises/contracts';
import type { User } from '../../database/entities/user.entity';
import type { ClientCreateDto } from '../dto/client-create.dto';
import type { ClientPassportUpdateDto } from '../dto/client-passport-update.dto';
import type { ClientPassportPlainOut } from '../types';

export interface IClientsService {
  create(body: ClientCreateDto, actor: User): Promise<ClientDto>;

  list(actor: User): Promise<ClientListDto[]>;

  getById(clientId: string, actor: User): Promise<ClientDetailDto>;

  getPassport(
    clientId: string,
    actor: User,
  ): Promise<ClientPassportPlainOut>;

  updatePassport(
    clientId: string,
    body: ClientPassportUpdateDto,
    actor: User,
  ): Promise<ClientDto>;

  remove(clientId: string, actor: User): Promise<{ ok: true }>;
}
