import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppsModule } from './apps/apps.module';
import { SettingsModule } from './settings/settings.module';
import { DatabaseModule } from './database/database.module';
import { SeedModule } from './seed/seed.module';
import { PortalScrapeModule } from './portal-scrape/portal-scrape.module';

@Module({
  imports: [
    DatabaseModule,
    SeedModule,
    HealthModule,
    AuthModule,
    UsersModule,
    AppsModule,
    SettingsModule,
    PortalScrapeModule,
  ],
})
export class AppModule {}
