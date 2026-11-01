import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import type { AppEnv } from '../config'
import { TYPEORM_ENTITIES } from './constants'
import { SchemaBootstrap } from './schema.bootstrap'

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService<AppEnv, true>) => ({
				type: 'postgres' as const,
				url: config.get('DATABASE_URL', { infer: true }),
				entities: [...TYPEORM_ENTITIES],
				synchronize: false,
				migrations: [__dirname + '/migrations/**/*{.js,.ts}'],
				migrationsRun: true,
			}),
		}),
		TypeOrmModule.forFeature([...TYPEORM_ENTITIES]),
	],
	providers: [SchemaBootstrap],
	exports: [TypeOrmModule],
})
export class DatabaseModule {}
