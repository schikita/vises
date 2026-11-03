import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  ClientDetailDto,
  ClientDto,
  ClientsListDto,
} from '@vises/contracts';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import {
  ADMIN_ROLE,
  AGENT_ROLE,
  SUPERADMIN_ROLE,
} from '../auth/constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../database/entities/user.entity';
import { ClientsService } from './clients.service';
import { ClientCreateDto } from './dto/client-create.dto';
import { ClientPassportUpdateDto } from './dto/client-passport-update.dto';
import { ClientsListQueryDto } from './dto/clients-list-query.dto';
import type { ClientPassportPlainOut } from './types';
import { parseClientsListQuery } from './utils';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clients: ClientsService) {}

  /** Agent-only create (FR-5 / AC-6). Admin/superadmin → `forbidden_role`. */
  @Post()
  @HttpCode(HttpStatus.OK)
  @Roles(AGENT_ROLE)
  create(
    @Body() body: ClientCreateDto,
    @CurrentUser() actor: User,
  ): Promise<ClientDto> {
    return this.clients.create(body, actor);
  }

  /**
   * Agent: own clients. Admin/superadmin: all.
   * Paginated envelope (DEC-P3). Decision 2A maskedPassport only (no plaintext).
   */
  @Get()
  @Roles(ADMIN_ROLE, SUPERADMIN_ROLE, AGENT_ROLE)
  list(
    @Query() query: ClientsListQueryDto,
    @CurrentUser() actor: User,
  ): Promise<ClientsListDto> {
    return this.clients.list(actor, parseClientsListQuery(query));
  }

  /**
   * Explicit decrypt path for passport filling UI (AC-10).
   * Requires client-creation debit ledger row (AC-7). Audited via PiiModule.
   * Declared before `:clientId` so Nest matches the static suffix first.
   * Companion to Decision 2A detail; retained non-breaking.
   */
  @Get(':clientId/passport')
  @Roles(ADMIN_ROLE, SUPERADMIN_ROLE, AGENT_ROLE)
  getPassport(
    @Param('clientId') clientId: string,
    @CurrentUser() actor: User,
  ): Promise<ClientPassportPlainOut> {
    return this.clients.getPassport(clientId, actor);
  }

  /** Encrypt passport PII write; gated by debit ledger (AC-7 / FR-6). */
  @Patch(':clientId/passport')
  @Roles(ADMIN_ROLE, SUPERADMIN_ROLE, AGENT_ROLE)
  updatePassport(
    @Param('clientId') clientId: string,
    @Body() body: ClientPassportUpdateDto,
    @CurrentUser() actor: User,
  ): Promise<ClientDto> {
    return this.clients.updatePassport(clientId, body, actor);
  }

  /**
   * Decision 2A detail: decrypted FR-6 plaintext + Winston PII audit every read.
   */
  @Get(':clientId')
  @Roles(ADMIN_ROLE, SUPERADMIN_ROLE, AGENT_ROLE)
  getById(
    @Param('clientId') clientId: string,
    @CurrentUser() actor: User,
  ): Promise<ClientDetailDto> {
    return this.clients.getById(clientId, actor);
  }

  /** Admin/superadmin only; no automatic refund (FR-8 / AC-17). */
  @Delete(':clientId')
  @HttpCode(HttpStatus.OK)
  @Roles(ADMIN_ROLE, SUPERADMIN_ROLE)
  remove(
    @Param('clientId') clientId: string,
    @CurrentUser() actor: User,
  ): Promise<{ ok: true }> {
    return this.clients.remove(clientId, actor);
  }
}
