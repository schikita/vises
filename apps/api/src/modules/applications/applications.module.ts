import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ApplicationStatusHistory } from '../database/entities/application-status-history.entity';
import { Application } from '../database/entities/application.entity';
import { Client } from '../database/entities/client.entity';
import { User } from '../database/entities/user.entity';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { APPLICATIONS_SERVICE } from './constants';
import { VisaCenterMonitorController } from './visa-center-monitor.controller';
import { VisaCenterMonitorGuard } from './visa-center-monitor.guard';

/**
 * Application status transitions + history + visa-center monitor (FR-7 / T9).
 * Operational list/CRUD remains on `modules/apps` (status column filters).
 * User is registered so JwtAuthGuard can resolve UserRepository in this module.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationStatusHistory,
      Client,
      User,
    ]),
    AuthModule,
  ],
  controllers: [ApplicationsController, VisaCenterMonitorController],
  providers: [
    ApplicationsService,
    VisaCenterMonitorGuard,
    { provide: APPLICATIONS_SERVICE, useExisting: ApplicationsService },
  ],
  exports: [ApplicationsService, APPLICATIONS_SERVICE],
})
export class ApplicationsModule {}
