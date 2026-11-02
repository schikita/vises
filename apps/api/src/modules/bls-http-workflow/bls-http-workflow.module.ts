import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BlsSecretsModule } from '../bls-secrets';
import { Application } from '../database/entities/application.entity';
import { BlsHttpWorkflowAttempt } from '../database/entities/bls-http-workflow-attempt.entity';
import { BlsHttpWorkflowEvent } from '../database/entities/bls-http-workflow-event.entity';
import { BlsHttpWorkflowStep } from '../database/entities/bls-http-workflow-step.entity';
import { BlsHttpWorkflowTask } from '../database/entities/bls-http-workflow-task.entity';
import { BlsHttpWorkflow } from '../database/entities/bls-http-workflow.entity';
import { User } from '../database/entities/user.entity';
import { TemporaryEmailModule } from '../temporary-email';
import { BlsHttpWorkflowLockService } from './bls-http-workflow-lock.service';
import { BlsHttpWorkflowAbortRegistry } from './bls-http-workflow-abort.registry';
import { BlsHttpWorkflowTerminalCleanupService } from './bls-http-workflow-terminal-cleanup.service';
import { BlsHttpWorkflowController } from './bls-http-workflow.controller';
import { BlsHttpWorkflowReconciler } from './bls-http-workflow.reconciler';
import { BlsHttpWorkflowRepository } from './bls-http-workflow.repository';
import { BlsHttpWorkflowService } from './bls-http-workflow.service';

/**
 * API process: control/read HTTP + durable graph services only (DEC-019).
 * No BlsHttpWorkflowRunner / Patchright / bls-clients / portal-fill.
 * Temporary-email NoOp adapter for terminal mailbox cleanup dispose/delete.
 */
const blsWorkflowProviders: Provider[] = [
  BlsHttpWorkflowReconciler,
  BlsHttpWorkflowTerminalCleanupService,
  BlsHttpWorkflowAbortRegistry,
  BlsHttpWorkflowRepository,
  BlsHttpWorkflowService,
  BlsHttpWorkflowLockService,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      User,
      BlsHttpWorkflow,
      BlsHttpWorkflowStep,
      BlsHttpWorkflowTask,
      BlsHttpWorkflowAttempt,
      BlsHttpWorkflowEvent,
    ]),
    AuthModule,
    BlsSecretsModule,
    TemporaryEmailModule,
  ],
  controllers: [BlsHttpWorkflowController],
  providers: blsWorkflowProviders,
  exports: [
    BlsHttpWorkflowTerminalCleanupService,
    BlsHttpWorkflowService,
    BlsHttpWorkflowRepository,
    BlsHttpWorkflowLockService,
    BlsHttpWorkflowAbortRegistry,
  ],
})
export class BlsHttpWorkflowModule {}
