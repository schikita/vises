import { Module } from '@nestjs/common';
import { AppConfigModule } from './modules/config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AppsModule } from './modules/apps/apps.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DatabaseModule } from './modules/database/database.module';
import { SeedModule } from './modules/seed/seed.module';
import { PortalScrapeModule } from './modules/portal-scrape/portal-scrape.module';

@Module({
  imports: [
    AppConfigModule,
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
