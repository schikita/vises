import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BalanceTransaction } from '../database/entities/balance-transaction.entity';
import { User } from '../database/entities/user.entity';
import { BalanceAuditService } from './balance-audit.service';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { BALANCE_SERVICE } from './constants';

/**
 * Agent balance top-up / adjust / ledger + exported debit-with-lock (FR-4 / T7).
 * Clients import this module for AC-6a row-locked debit.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, BalanceTransaction]),
    AuthModule,
  ],
  controllers: [BalanceController],
  providers: [
    BalanceService,
    BalanceAuditService,
    { provide: BALANCE_SERVICE, useExisting: BalanceService },
  ],
  exports: [BalanceService, BALANCE_SERVICE, BalanceAuditService],
})
export class BalanceModule {}
