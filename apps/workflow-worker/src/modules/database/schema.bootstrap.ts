import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { backfillApplicationApplicantPassportFields } from './utils';

/**
 * After TypeORM synchronize:
 * - DEC-003: ensure legacy `applications.extras` column.
 * - proxy6-migration DEC-002 / CON-008: drop retired settings proxy columns
 *   (synchronize may not drop columns; legacy names in DROP IF EXISTS).
 * - durable-bls-workflow DEC-012 / DEC-020: ensure BLS indexes + partial unique
 *   for one active workflow per application (synchronize cannot express partial
 *   unique). Does **not** drop `portal_autofill_runs`.
 * - bls-register-ymd-passport-fields: backfill applicant jsonb
 *   `passportType` / `passportIssueCountry` (defaults + known legacy labels).
 * Seed-if-empty runs in SeedService.onModuleInit (keeps database ↔ seed imports one-way).
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

    await this.ensureBlsWorkflowIndexes();
    await this.ensureApplicantPassportFields();
  }

  private async ensureApplicantPassportFields(): Promise<void> {
    const updated = await backfillApplicationApplicantPassportFields(
      this.dataSource,
    );
    this.logger.log(
      `Schema ensure: applications.applicants passportType/passportIssueCountry backfill OK (rows updated=${updated})`,
    );
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
