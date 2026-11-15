import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { BlsWorkflowModule } from '../bls-workflow';
import { ClientsModule } from '../clients/clients.module';
import { PortalScrapeModule } from '../portal-scrape';
import { UsersModule } from '../users/users.module';
import { APPS_SERVICE } from './constants';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';
import { PaymentsController } from './payments.controller';
import { VisitsController } from './visits.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, User]),
    AuthModule,
    UsersModule,
    /** DEC-PF-011: staff upsert may create CRM Client + debit when clientId absent. */
    ClientsModule,
    BlsWorkflowModule,
    /** Client-safe portalProgress embed on app read (DEC-007 / A-API-1). */
    PortalScrapeModule,
  ],
  controllers: [AppsController, VisitsController, PaymentsController],
  providers: [
    AppsService,
    { provide: APPS_SERVICE, useExisting: AppsService },
  ],
  exports: [AppsService, APPS_SERVICE],
})
export class AppsModule {}
