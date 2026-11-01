import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationStatusHistory } from '../database/entities/application-status-history.entity';
import { Application } from '../database/entities/application.entity';
import { BalanceTransaction } from '../database/entities/balance-transaction.entity';
import { Client } from '../database/entities/client.entity';
import { Setting } from '../database/entities/setting.entity';
import { User } from '../database/entities/user.entity';
import { PiiModule } from '../pii';
import { SeedService } from './seed.service';

@Module({
  imports: [
    PiiModule,
    TypeOrmModule.forFeature([
      User,
      Application,
      Client,
      Setting,
      ApplicationStatusHistory,
      BalanceTransaction,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
