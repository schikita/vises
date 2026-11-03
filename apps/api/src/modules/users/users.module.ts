import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../database/entities/application.entity';
import { BalanceTransaction } from '../database/entities/balance-transaction.entity';
import { Client } from '../database/entities/client.entity';
import { User } from '../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { USERS_SERVICE } from './constants';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Application,
      Client,
      BalanceTransaction,
    ]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: USERS_SERVICE, useExisting: UsersService },
  ],
  exports: [UsersService, USERS_SERVICE],
})
export class UsersModule {}
