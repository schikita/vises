import { Module } from '@nestjs/common'
import { AppConfigModule } from './modules/config'
import { LoggerModule } from './modules/logger'
import { HealthModule } from './modules/health/health.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { ApplicationsModule } from './modules/applications/applications.module'
import { AppsModule } from './modules/apps/apps.module'
import { SettingsModule } from './modules/settings/settings.module'
import { StatsModule } from './modules/stats'
import { AnalyticsModule } from './modules/analytics/analytics.module'
import { DatabaseModule } from './modules/database/database.module'
import { SeedModule } from './modules/seed/seed.module'
import { BlsWorkflowModule } from './modules/bls-workflow'
import { MessagingModule } from './modules/messaging'
import { PortalScrapeModule } from './modules/portal-scrape'
import { Proxy6Module } from './modules/proxy6'
import { PiiModule } from './modules/pii'
import { BalanceModule } from './modules/balance/balance.module'
import { ClientsModule } from './modules/clients/clients.module'

@Module({
	imports: [
		AppConfigModule,
		LoggerModule,
		DatabaseModule,
		SeedModule,
		HealthModule,
		MessagingModule,
		AuthModule,
		UsersModule,
		AppsModule,
		ApplicationsModule,
		SettingsModule,
		StatsModule,
		AnalyticsModule,
		PiiModule,
		BalanceModule,
		ClientsModule,
		BlsWorkflowModule,
		PortalScrapeModule,
		Proxy6Module,
	],
})
export class AppModule {}
