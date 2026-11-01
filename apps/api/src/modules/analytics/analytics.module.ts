import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ApplicationStatusHistory } from '../database/entities/application-status-history.entity';
import { Application } from '../database/entities/application.entity';
import { Client } from '../database/entities/client.entity';
import { User } from '../database/entities/user.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ANALYTICS_SERVICE } from './constants';

/**
 * Analytics aggregates / percentages (FR-9 / §6.7.1 / T10).
 * Coexists with legacy StatsModule (`GET /stats/dashboard`).
 * User is registered so JwtAuthGuard can resolve UserRepository in this module.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      Client,
      ApplicationStatusHistory,
      User,
    ]),
    AuthModule,
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    { provide: ANALYTICS_SERVICE, useExisting: AnalyticsService },
  ],
  exports: [AnalyticsService, ANALYTICS_SERVICE],
})
export class AnalyticsModule {}
