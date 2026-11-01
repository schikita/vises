import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Boot-time schema ensures (synchronize permanently false — T2.5):
 * - DEC-003: ensure legacy `applications.extras` column.
 * - proxy6-migration DEC-002 / CON-008: drop retired settings proxy columns.
 * - durable-bls-workflow DEC-012 / DEC-020: ensure BLS indexes + partial unique
 *   for one active workflow per application. Does **not** drop `portal_autofill_runs`.
 * - roles-and-applications T12: drop legacy `applications.applicants` jsonb;
 *   unique partial index for at most one `superadmin`; ensure unique
 *   `applications.client_id`; ensure `users.balance` (AC-1 / AC-6 / AC-9).
 *   No applicants passport backfill (column removed).
 */
@Injectable()
export class SchemaBootstrap implements OnModuleInit {
  private readonly logger = new Logger(SchemaBootstrap.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    await this.dataSource.query(
      `ALTER TABLE applications ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '{}'::jsonb`,
    );
    this.logger.log('Schema ensure: applications.extras column OK');

    await this.dataSource.query(
      `ALTER TABLE settings DROP COLUMN IF EXISTS webshare_proxy_enabled`,
    );
    await this.dataSource.query(
      `ALTER TABLE settings DROP COLUMN IF EXISTS webshare_plan_id`,
    );
    this.logger.log(
      'Schema ensure: settings legacy proxy columns dropped (IF EXISTS)',
    );

    await this.ensureRolesAndApplicationsSchema();
    await this.ensureBlsWorkflowIndexes();
  }

  /**
   * Constraints / drops synchronize cannot express for roles-and-applications.
   * Mirrors API SchemaBootstrap IF NOT EXISTS / DROP IF EXISTS paths only.
   */
  private async ensureRolesAndApplicationsSchema(): Promise<void> {
    await this.dataSource.query(
      `ALTER TABLE applications DROP COLUMN IF EXISTS applicants`,
    );
    this.logger.log(
      'Schema ensure: applications.applicants jsonb dropped (IF EXISTS)',
    );

    await this.dataSource.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_users_one_superadmin
      ON users (role)
      WHERE role = 'superadmin'
    `);
    this.logger.log(
      'Schema ensure: users at-most-one-superadmin partial unique OK',
    );

    await this.dataSource.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_applications_client_id
      ON applications (client_id)
    `);
    this.logger.log(
      'Schema ensure: applications.client_id unique index OK',
    );

    await this.dataSource.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS balance NUMERIC(14, 2) DEFAULT 0
    `);
    this.logger.log('Schema ensure: users.balance column OK');
  }

  /**
   * Indexes / partial unique for `bls_*` tables (docs/sdd/02-database-redesign.md).
   * Active status set mirrors `BLS_WORKFLOW_ACTIVE_STATUSES` in portal-scrape
   * (kept as SQL literals so database does not import portal-scrape).
   */
  private async ensureBlsWorkflowIndexes(): Promise<void> {
    await this.dataSource.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_bls_workflows_one_active_per_application
      ON bls_workflows (application_id)
      WHERE status IN (
        'PENDING',
        'RUNNING',
        'WAITING_RETRY',
        'WAITING_STAFF',
        'PAUSED'
      )
    `);

    await this.dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_bls_workflows_status_next_run_at
      ON bls_workflows (status, next_run_at)
    `);

    await this.dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_bls_workflows_lock_heartbeat_when_locked
      ON bls_workflows (lock_heartbeat_at)
      WHERE lock_owner IS NOT NULL
    `);

    await this.dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_bls_workflows_application_created_at_desc
      ON bls_workflows (application_id, created_at DESC)
    `);

    await this.dataSource.query(`
      ALTER TABLE bls_workflows
      ADD COLUMN IF NOT EXISTS mailbox_cleanup_due_at TIMESTAMPTZ NULL
    `);

    await this.dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_bls_workflows_mailbox_cleanup_due_at
      ON bls_workflows (mailbox_cleanup_due_at)
      WHERE mailbox_cleanup_due_at IS NOT NULL
    `);

    await this.dataSource.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_bls_workflow_steps_workflow_step_key
      ON bls_workflow_steps (workflow_id, step_key)
    `);

    await this.dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_bls_workflow_steps_workflow_ordinal
      ON bls_workflow_steps (workflow_id, ordinal)
    `);

    await this.dataSource.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_bls_workflow_tasks_step_ordinal
      ON bls_workflow_tasks (step_id, ordinal)
    `);

    await this.dataSource.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_bls_workflow_attempts_task_attempt_no
      ON bls_workflow_attempts (task_id, attempt_no)
    `);

    await this.dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_bls_workflow_attempts_task_started_at_desc
      ON bls_workflow_attempts (task_id, started_at DESC)
    `);

    await this.dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_bls_workflow_events_workflow_id_id
      ON bls_workflow_events (workflow_id, id)
    `);

    await this.dataSource.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_bls_secret_vault_workflow_purpose
      ON bls_secret_vault (workflow_id, purpose)
    `);

    this.logger.log(
      'Schema ensure: bls_* indexes + one-active-workflow partial unique OK (portal_autofill_runs retained)',
    );
  }
}
