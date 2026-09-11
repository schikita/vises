import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { APPS_SERVICE } from './constants';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, User]),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppsController],
  providers: [
    AppsService,
    { provide: APPS_SERVICE, useExisting: AppsService },
  ],
  exports: [AppsService, APPS_SERVICE],
})
export class AppsModule {}
