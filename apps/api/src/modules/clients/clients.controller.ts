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
  UseGuards,
} from '@nestjs/common';
import type {
  ClientDto,
  ClientListDto,
  ClientPortalFormDetailDto,
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
import { ClientPortalFormUpdateDto } from './dto/client-portal-form-update.dto';
import type {
  ClientDetailWithPortalFormDto,
  ClientPassportPlainOut,
} from './types';

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
   * Decision 2A `ClientListDto` — maskedPassport string only (no plaintext passport).
   */
  @Get()
  @Roles(ADMIN_ROLE, SUPERADMIN_ROLE, AGENT_ROLE)
  list(@CurrentUser() actor: User): Promise<ClientListDto[]> {
    return this.clients.list(actor);
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
   * Portal-form plaintext write (REQ-004 / DEC-002).
   * Dedicated route — not conflated with FR-6 passport unlock gate.
   * Declared before `:clientId` so Nest matches the static suffix first.
   */
  @Patch(':clientId/portal-form')
  @Roles(ADMIN_ROLE, SUPERADMIN_ROLE, AGENT_ROLE)
  updatePortalForm(
    @Param('clientId') clientId: string,
    @Body() body: ClientPortalFormUpdateDto,
    @CurrentUser() actor: User,
  ): Promise<ClientPortalFormDetailDto> {
    return this.clients.updatePortalForm(clientId, body, actor);
  }

  /**
   * Decision 2A detail: decrypted FR-6 plaintext + Winston PII audit every read.
   * Includes portal-form fields for future FE (DEC-004).
   */
  @Get(':clientId')
  @Roles(ADMIN_ROLE, SUPERADMIN_ROLE, AGENT_ROLE)
  getById(
    @Param('clientId') clientId: string,
    @CurrentUser() actor: User,
  ): Promise<ClientDetailWithPortalFormDto> {
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
