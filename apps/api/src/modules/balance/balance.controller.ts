import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  BalanceTransactionDto,
  BalanceTransactionsListDto,
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
import { BalanceService } from './balance.service';
import { BalanceAdjustDto } from './dto/balance-adjust.dto';
import { BalanceTopUpDto } from './dto/balance-top-up.dto';
import { BalanceTransactionsQueryDto } from './dto/balance-transactions-query.dto';
import { parseBalanceTransactionsQuery } from './utils';

@Controller('agents/:agentId/balance')
@UseGuards(JwtAuthGuard)
export class BalanceController {
  constructor(private readonly balance: BalanceService) {}

  /** Admin / superadmin only (FR-4 / §6.4 / AC-8). Agents → `forbidden_role`. */
  @Post('top-up')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(ADMIN_ROLE, SUPERADMIN_ROLE)
  topUp(
    @Param('agentId') agentId: string,
    @Body() body: BalanceTopUpDto,
    @CurrentUser() actor: User,
  ): Promise<BalanceTransactionDto> {
    return this.balance.topUp(agentId, body, actor);
  }

  /** Admin / superadmin only; non-empty reason required (FR-4 / AC-8). */
  @Post('adjust')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(ADMIN_ROLE, SUPERADMIN_ROLE)
  adjust(
    @Param('agentId') agentId: string,
    @Body() body: BalanceAdjustDto,
    @CurrentUser() actor: User,
  ): Promise<BalanceTransactionDto> {
    return this.balance.adjust(agentId, body, actor);
  }

  /**
   * Admin/superadmin: any agent. Owning agent: self read-only (§6.4).
   * Paginated newest-first ledger (DEC-P4).
   */
  @Get('transactions')
  @UseGuards(RolesGuard)
  @Roles(ADMIN_ROLE, SUPERADMIN_ROLE, AGENT_ROLE)
  listTransactions(
    @Param('agentId') agentId: string,
    @Query() query: BalanceTransactionsQueryDto,
    @CurrentUser() actor: User,
  ): Promise<BalanceTransactionsListDto> {
    return this.balance.listTransactions(
      agentId,
      actor,
      parseBalanceTransactionsQuery(query),
    );
  }
}
