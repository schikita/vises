import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { AppEnv } from '../config';
import { User } from './entities/user.entity';
import { Application } from './entities/application.entity';
import { Setting } from './entities/setting.entity';
import { PortalAutofillRun } from './entities/portal-autofill-run.entity';
import { Proxy6Proxy } from './entities/proxy6-proxy.entity';
import { BlsWorkflow } from './entities/bls-workflow.entity';
import { BlsWorkflowStep } from './entities/bls-workflow-step.entity';
import { BlsWorkflowTask } from './entities/bls-workflow-task.entity';
import { BlsWorkflowAttempt } from './entities/bls-workflow-attempt.entity';
import { BlsWorkflowEvent } from './entities/bls-workflow-event.entity';
import { BlsSecretVault } from './entities/bls-secret-vault.entity';
import { SchemaBootstrap } from './schema.bootstrap';

const ENTITIES = [
  User,
  Application,
  Setting,
  PortalAutofillRun,
  Proxy6Proxy,
  BlsWorkflow,
  BlsWorkflowStep,
  BlsWorkflowTask,
  BlsWorkflowAttempt,
  BlsWorkflowEvent,
  BlsSecretVault,
] as const;

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>) => ({
        type: 'postgres' as const,
        url: config.get('DATABASE_URL', { infer: true }),
        entities: [...ENTITIES],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([...ENTITIES]),
  ],
  providers: [SchemaBootstrap],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
