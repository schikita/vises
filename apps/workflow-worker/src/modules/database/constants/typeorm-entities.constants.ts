import { User } from '../entities/user.entity';
import { Application } from '../entities/application.entity';
import { Setting } from '../entities/setting.entity';
import { Client } from '../entities/client.entity';
import { BalanceTransaction } from '../entities/balance-transaction.entity';
import { ApplicationStatusHistory } from '../entities/application-status-history.entity';
import { PortalAutofillRun } from '../entities/portal-autofill-run.entity';
import { Proxy6Proxy } from '../entities/proxy6-proxy.entity';
import { BlsWorkflow } from '../entities/bls-workflow.entity';
import { BlsWorkflowStep } from '../entities/bls-workflow-step.entity';
import { BlsWorkflowTask } from '../entities/bls-workflow-task.entity';
import { BlsWorkflowAttempt } from '../entities/bls-workflow-attempt.entity';
import { BlsWorkflowEvent } from '../entities/bls-workflow-event.entity';
import { BlsSecretVault } from '../entities/bls-secret-vault.entity';

/**
 * Single source of truth for Nest DatabaseModule entity registration.
 * Add any future CLI DataSource against this list to avoid Nest/CLI drift.
 */
export const TYPEORM_ENTITIES = [
  User,
  Application,
  Setting,
  Client,
  BalanceTransaction,
  ApplicationStatusHistory,
  PortalAutofillRun,
  Proxy6Proxy,
  BlsWorkflow,
  BlsWorkflowStep,
  BlsWorkflowTask,
  BlsWorkflowAttempt,
  BlsWorkflowEvent,
  BlsSecretVault,
] as const;
