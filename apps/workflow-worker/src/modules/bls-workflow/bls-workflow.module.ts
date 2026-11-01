import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlsClientsModule } from '../bls-clients';
import { BlsSecretsModule } from '../bls-secrets';
import { BrowserMailModule } from '../browser-mail';
import { Application } from '../database/entities/application.entity';
import { Client } from '../database/entities/client.entity';
import { BlsWorkflowAttempt } from '../database/entities/bls-workflow-attempt.entity';
import { BlsWorkflowEvent } from '../database/entities/bls-workflow-event.entity';
import { BlsWorkflowStep } from '../database/entities/bls-workflow-step.entity';
import { BlsWorkflowTask } from '../database/entities/bls-workflow-task.entity';
import { BlsWorkflow } from '../database/entities/bls-workflow.entity';
import { User } from '../database/entities/user.entity';
import { PortalCoreModule } from '../portal-core';
import { BlsWorkflowLockService } from './bls-workflow-lock.service';
import { BlsWorkflowAbortRegistry } from './bls-workflow-abort.registry';
import { BlsWorkflowTaskExecutor } from './bls-workflow-task-executor.service';
import { BlsWorkflowTerminalCleanupService } from './bls-workflow-terminal-cleanup.service';
import { BlsWorkflowReconciler } from './bls-workflow.reconciler';
import { BlsWorkflowRepository } from './bls-workflow.repository';
import { BlsWorkflowRunner } from './bls-workflow.runner';
import { BlsWorkflowService } from './bls-workflow.service';
import { BLS_WORKFLOW_TASK_EXECUTOR } from './constants/bls-workflow-di.tokens';

const blsWorkflowProviders: Provider[] = [
  /** Boot workflow lock clear only — runner claims due work (DEC-018). */
  BlsWorkflowReconciler,
  /** Terminal temporary email + vault + events TTL cleanup (TASK-018 / REQ-016). */
  BlsWorkflowTerminalCleanupService,
  /** Process-local abort registry for pause/cancel/abandon (DEC-001). */
  BlsWorkflowAbortRegistry,
  /** Durable workflow graph + state machine (TASK-002). */
  BlsWorkflowRepository,
  BlsWorkflowService,
  /** Workflow lock + attempt persistence (TASK-003 / DEC-003). */
  BlsWorkflowLockService,
  /**
   * Dispatcher executor → domain clients by step/task key (DEC-008 / DEC-004).
   * Lives here (not bls-clients) so Nest edge is workflow → clients only.
   */
  BlsWorkflowTaskExecutor,
  {
    provide: BLS_WORKFLOW_TASK_EXECUTOR,
    useExisting: BlsWorkflowTaskExecutor,
  },
  /** DB claim/runner tick — worker process only (DEC-019 / REQ-002). */
  BlsWorkflowRunner,
];

/**
 * Worker-owned durable orchestration + task executor (DEC-019).
 * Control/read HTTP controllers stay on @vises/api.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      Client,
      User,
      BlsWorkflow,
      BlsWorkflowStep,
      BlsWorkflowTask,
      BlsWorkflowAttempt,
      BlsWorkflowEvent,
    ]),
    BlsClientsModule,
    BlsSecretsModule,
    BrowserMailModule,
    PortalCoreModule,
  ],
  controllers: [],
  providers: blsWorkflowProviders,
  exports: [
    BlsWorkflowTerminalCleanupService,
    BlsWorkflowService,
    BlsWorkflowRepository,
    BlsWorkflowLockService,
    BlsWorkflowAbortRegistry,
    BlsWorkflowRunner,
    BlsWorkflowTaskExecutor,
    BLS_WORKFLOW_TASK_EXECUTOR,
  ],
})
export class BlsWorkflowModule {}
