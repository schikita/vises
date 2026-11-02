import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortalHttpModule } from '../portal-http/portal-http.module';
import { BlsSecretsModule } from '../bls-secrets';
import { TempMailPlusHttpAdapter } from '../portal-http/tempmail-plus-http.adapter';
import { TEMPORARY_EMAIL_PROVIDER } from '../temporary-email';
import { Application } from '../database/entities/application.entity';
import { BlsHttpWorkflowAttempt } from '../database/entities/bls-http-workflow-attempt.entity';
import { BlsHttpWorkflowEvent } from '../database/entities/bls-http-workflow-event.entity';
import { BlsHttpWorkflowStep } from '../database/entities/bls-http-workflow-step.entity';
import { BlsHttpWorkflowTask } from '../database/entities/bls-http-workflow-task.entity';
import { BlsHttpWorkflow } from '../database/entities/bls-http-workflow.entity';
import { User } from '../database/entities/user.entity';
import { PortalCoreModule } from '../portal-core';
import { BlsHttpWorkflowLockService } from './bls-http-workflow-lock.service';
import { BlsHttpWorkflowAbortRegistry } from './bls-http-workflow-abort.registry';
import { BlsHttpWorkflowTaskExecutor } from './bls-http-workflow-task-executor.service';
import { BlsHttpWorkflowTerminalCleanupService } from './bls-http-workflow-terminal-cleanup.service';
import { BlsHttpWorkflowReconciler } from './bls-http-workflow.reconciler';
import { BlsHttpWorkflowRepository } from './bls-http-workflow.repository';
import { BlsHttpWorkflowRunner } from './bls-http-workflow.runner';
import { BlsHttpWorkflowService } from './bls-http-workflow.service';
import { BLS_HTTP_WORKFLOW_TASK_EXECUTOR } from './constants/bls-http-workflow-di.tokens';

const blsHttpWorkflowProviders: Provider[] = [
  TempMailPlusHttpAdapter,
  { provide: TEMPORARY_EMAIL_PROVIDER, useExisting: TempMailPlusHttpAdapter },
  /** Boot workflow lock clear only — runner claims due work (DEC-018). */
  BlsHttpWorkflowReconciler,
  /** Terminal temporary email + vault + events TTL cleanup (TASK-018 / REQ-016). */
  BlsHttpWorkflowTerminalCleanupService,
  /** Process-local abort registry for pause/cancel/abandon (DEC-001). */
  BlsHttpWorkflowAbortRegistry,
  /** Durable workflow graph + state machine (TASK-002). */
  BlsHttpWorkflowRepository,
  BlsHttpWorkflowService,
  /** Workflow lock + attempt persistence (TASK-003 / DEC-003). */
  BlsHttpWorkflowLockService,
  /**
   * Dispatcher executor → domain clients by step/task key (DEC-008 / DEC-004).
   * Lives here (not bls-clients) so Nest edge is workflow → clients only.
   */
  BlsHttpWorkflowTaskExecutor,
  {
    provide: BLS_HTTP_WORKFLOW_TASK_EXECUTOR,
    useExisting: BlsHttpWorkflowTaskExecutor,
  },
  /** DB claim/runner tick — worker process only (DEC-019 / REQ-002). */
  BlsHttpWorkflowRunner,
];

/**
 * Worker-owned durable orchestration + task executor (DEC-019).
 * Control/read HTTP controllers stay on @vises/api.
 */
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
    PortalHttpModule,
    BlsSecretsModule,
    PortalCoreModule,
  ],
  controllers: [],
  providers: blsHttpWorkflowProviders,
  exports: [
    BlsHttpWorkflowTerminalCleanupService,
    BlsHttpWorkflowService,
    BlsHttpWorkflowRepository,
    BlsHttpWorkflowLockService,
    BlsHttpWorkflowAbortRegistry,
    BlsHttpWorkflowRunner,
    BlsHttpWorkflowTaskExecutor,
    BLS_HTTP_WORKFLOW_TASK_EXECUTOR,
  ],
})
export class BlsHttpWorkflowModule {}
