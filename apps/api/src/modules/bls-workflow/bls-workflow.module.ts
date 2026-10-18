import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BlsSecretsModule } from '../bls-secrets';
import { Application } from '../database/entities/application.entity';
import { BlsWorkflowAttempt } from '../database/entities/bls-workflow-attempt.entity';
import { BlsWorkflowEvent } from '../database/entities/bls-workflow-event.entity';
import { BlsWorkflowStep } from '../database/entities/bls-workflow-step.entity';
import { BlsWorkflowTask } from '../database/entities/bls-workflow-task.entity';
import { BlsWorkflow } from '../database/entities/bls-workflow.entity';
import { User } from '../database/entities/user.entity';
import { TemporaryEmailModule } from '../temporary-email';
import { BlsWorkflowLockService } from './bls-workflow-lock.service';
import { BlsWorkflowAbortRegistry } from './bls-workflow-abort.registry';
import { BlsWorkflowTerminalCleanupService } from './bls-workflow-terminal-cleanup.service';
import { BlsWorkflowController } from './bls-workflow.controller';
import { BlsWorkflowReconciler } from './bls-workflow.reconciler';
import { BlsWorkflowRepository } from './bls-workflow.repository';
import { BlsWorkflowService } from './bls-workflow.service';

/**
 * API process: control/read HTTP + durable graph services only (DEC-019).
 * No BlsWorkflowRunner / Patchright / bls-clients / portal-fill.
 * Temporary-email NoOp adapter for terminal mailbox cleanup dispose/delete.
 */
const blsWorkflowProviders: Provider[] = [
  BlsWorkflowReconciler,
  BlsWorkflowTerminalCleanupService,
  BlsWorkflowAbortRegistry,
  BlsWorkflowRepository,
  BlsWorkflowService,
  BlsWorkflowLockService,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      User,
      BlsWorkflow,
      BlsWorkflowStep,
      BlsWorkflowTask,
      BlsWorkflowAttempt,
      BlsWorkflowEvent,
    ]),
    AuthModule,
    BlsSecretsModule,
    TemporaryEmailModule,
  ],
  controllers: [BlsWorkflowController],
  providers: blsWorkflowProviders,
  exports: [
    BlsWorkflowTerminalCleanupService,
    BlsWorkflowService,
    BlsWorkflowRepository,
    BlsWorkflowLockService,
    BlsWorkflowAbortRegistry,
  ],
})
export class BlsWorkflowModule {}
