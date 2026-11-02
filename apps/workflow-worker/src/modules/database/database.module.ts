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
import { BlsHttpWorkflow } from './entities/bls-http-workflow.entity';
import { BlsHttpWorkflowStep } from './entities/bls-http-workflow-step.entity';
import { BlsHttpWorkflowTask } from './entities/bls-http-workflow-task.entity';
import { BlsHttpWorkflowAttempt } from './entities/bls-http-workflow-attempt.entity';
import { BlsHttpWorkflowEvent } from './entities/bls-http-workflow-event.entity';
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
  BlsHttpWorkflow,
  BlsHttpWorkflowStep,
  BlsHttpWorkflowTask,
  BlsHttpWorkflowAttempt,
  BlsHttpWorkflowEvent,
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
        // Self-healing DB layer: a lost/stalled query or a leaked pooled
        // connection must reject after a timeout instead of queueing forever
        // (symptom: runner ticks freeze silently holding the shared attempt
        // budget). statement/query timeouts roll the transaction back and
        // return the connection to the pool.
        extra: {
          max: 20,
          connectionTimeoutMillis: 30_000,
          idleTimeoutMillis: 30_000,
          statement_timeout: 60_000,
          query_timeout: 60_000,
        },
      }),
    }),
    TypeOrmModule.forFeature([...ENTITIES]),
  ],
  providers: [SchemaBootstrap],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
