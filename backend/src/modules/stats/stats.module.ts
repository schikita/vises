import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { STATS_SERVICE } from './constants';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, User]),
    AuthModule,
  ],
  controllers: [StatsController],
  providers: [
    StatsService,
    { provide: STATS_SERVICE, useExisting: StatsService },
  ],
  exports: [StatsService, STATS_SERVICE],
})
export class StatsModule {}
