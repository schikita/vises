import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { AppEnv } from '../config';
import { User } from './entities/user.entity';
import { Application } from './entities/application.entity';
import { Setting } from './entities/setting.entity';
import { PortalAutofillRun } from './entities/portal-autofill-run.entity';
import { SchemaBootstrap } from './schema.bootstrap';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>) => ({
        type: 'postgres' as const,
        url: config.get('DATABASE_URL', { infer: true }),
        entities: [User, Application, Setting, PortalAutofillRun],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Application,
      Setting,
      PortalAutofillRun,
    ]),
  ],
  providers: [SchemaBootstrap],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
