import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type { BalanceTransactionDto } from '@vises/contracts';
import { DataSource, type EntityManager, Repository } from 'typeorm';
import { uid } from '../../shared/utils';
import { BalanceTransaction } from '../database/entities/balance-transaction.entity';
import { User } from '../database/entities/user.entity';
import { BalanceAuditService } from './balance-audit.service';
import { TOP_UP_DEFAULT_REASON } from './constants';
import type { BalanceAdjustDto } from './dto/balance-adjust.dto';
import type { BalanceTopUpDto } from './dto/balance-top-up.dto';
import type { IBalanceService } from './interfaces';
import type { DebitWithLockInput } from './types';
import {
  applyBalanceDelta,
  assertCanReadLedger,
  assertNonEmptyReason,
  formatMoneyCents,
  lockAgentUserForUpdate,
  mapBalanceTransactionToDto,
  parseMoneyDecimalString,
  throwInsufficientBalance,
  throwInvalidAmount,
} from './utils';

@Injectable()
export class BalanceService implements IBalanceService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(BalanceTransaction)
    private readonly ledger: Repository<BalanceTransaction>,
    private readonly audit: BalanceAuditService,
  ) {}

  async topUp(
    agentId: string,
    body: BalanceTopUpDto,
    actor: User,
  ): Promise<BalanceTransactionDto> {
    const deltaCents = parseMoneyDecimalString(body.amount);
    if (deltaCents <= 0n) {
      return throwInvalidAmount();
    }
    const amount = formatMoneyCents(deltaCents);

    return this.dataSource.transaction(
      async (manager: EntityManager): Promise<BalanceTransactionDto> => {
        const agent = await lockAgentUserForUpdate(manager, agentId);
        const resultingBalance = applyBalanceDelta(agent.balance, deltaCents);
        agent.balance = resultingBalance;
        agent.updatedAt = new Date();
        await manager.save(User, agent);

        const row = manager.create(BalanceTransaction, {
          id: uid('btx'),
          agentId: agent.id,
          actorId: actor.id,
          type: 'top_up',
          amount,
          reason: TOP_UP_DEFAULT_REASON,
          resultingBalance,
          clientId: null,
          createdAt: new Date(),
        });
        const saved = await manager.save(BalanceTransaction, row);
        return mapBalanceTransactionToDto(saved);
      },
    );
  }

  async adjust(
    agentId: string,
    body: BalanceAdjustDto,
    actor: User,
  ): Promise<BalanceTransactionDto> {
    const reason = assertNonEmptyReason(body.reason);
    const deltaCents = parseMoneyDecimalString(body.amount);
    if (deltaCents === 0n) {
      return throwInvalidAmount();
    }
    const amount = formatMoneyCents(deltaCents);

    const dto = await this.dataSource.transaction(
      async (manager: EntityManager): Promise<BalanceTransactionDto> => {
        const agent = await lockAgentUserForUpdate(manager, agentId);
        const resultingBalance = applyBalanceDelta(agent.balance, deltaCents);
        agent.balance = resultingBalance;
        agent.updatedAt = new Date();
        await manager.save(User, agent);

        const row = manager.create(BalanceTransaction, {
          id: uid('btx'),
          agentId: agent.id,
          actorId: actor.id,
          type: 'adjust',
          amount,
          reason,
          resultingBalance,
          clientId: null,
          createdAt: new Date(),
        });
        const saved = await manager.save(BalanceTransaction, row);
        return mapBalanceTransactionToDto(saved);
      },
    );

    this.audit.logAdjust({
      actorId: actor.id,
      targetAgentId: agentId,
      amount: dto.amount,
      reason: dto.reason,
      resultingBalance: dto.resultingBalance,
    });

    return dto;
  }

  async listTransactions(
    agentId: string,
    actor: User,
  ): Promise<BalanceTransactionDto[]> {
    assertCanReadLedger({
      actorRole: actor.role,
      actorId: actor.id,
      agentId,
    });

    const rows = await this.ledger.find({
      where: { agentId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((row) => mapBalanceTransactionToDto(row));
  }

  async debitWithLock(
    manager: EntityManager,
    input: DebitWithLockInput,
  ): Promise<BalanceTransactionDto> {
    const debitCents = parseMoneyDecimalString(input.amount);
    if (debitCents <= 0n) {
      return throwInvalidAmount();
    }

    const agent = await lockAgentUserForUpdate(manager, input.agentId);
    const currentCents =
      agent.balance == null || agent.balance === ''
        ? 0n
        : parseMoneyDecimalString(String(agent.balance));
    if (currentCents < debitCents) {
      return throwInsufficientBalance();
    }

    const resultingBalance = formatMoneyCents(currentCents - debitCents);
    const amount = formatMoneyCents(-debitCents);
    agent.balance = resultingBalance;
    agent.updatedAt = new Date();
    await manager.save(User, agent);

    const row = manager.create(BalanceTransaction, {
      id: uid('btx'),
      agentId: agent.id,
      actorId: input.actorId,
      type: 'client_creation_debit',
      amount,
      reason: input.reason,
      resultingBalance,
      clientId: input.clientId,
      createdAt: new Date(),
    });
    const saved = await manager.save(BalanceTransaction, row);
    return mapBalanceTransactionToDto(saved);
  }
}
