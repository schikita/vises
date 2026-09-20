import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from '../database/entities/setting.entity';
import { User } from '../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { SeedModule } from '../seed/seed.module';
import { WebshareModule } from '../webshare';
import { SETTINGS_SERVICE } from './constants';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting, User]),
    AuthModule,
    SeedModule,
    WebshareModule,
  ],
  controllers: [SettingsController],
  providers: [
    SettingsService,
    { provide: SETTINGS_SERVICE, useExisting: SettingsService },
  ],
  exports: [SettingsService, SETTINGS_SERVICE],
})
export class SettingsModule {}
