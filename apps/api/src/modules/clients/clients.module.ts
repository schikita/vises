import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BalanceModule } from '../balance/balance.module';
import { ApplicationStatusHistory } from '../database/entities/application-status-history.entity';
import { Application } from '../database/entities/application.entity';
import { BalanceTransaction } from '../database/entities/balance-transaction.entity';
import { Client } from '../database/entities/client.entity';
import { User } from '../database/entities/user.entity';
import { PiiModule } from '../pii';
import { SettingsModule } from '../settings/settings.module';
import { CLIENTS_SERVICE } from './constants';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

/**
 * Client create (txn + debit), passport fill, delete, masked list/detail (T8).
 * Imports BalanceModule (`debitWithLock`), PiiModule, SettingsModule.
 * User is registered so JwtAuthGuard can resolve UserRepository in this module.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      Application,
      ApplicationStatusHistory,
      BalanceTransaction,
      User,
    ]),
    AuthModule,
    BalanceModule,
    PiiModule,
    SettingsModule,
  ],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    { provide: CLIENTS_SERVICE, useExisting: ClientsService },
  ],
  exports: [ClientsService, CLIENTS_SERVICE],
})
export class ClientsModule {}
