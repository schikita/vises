import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Boot-time schema ensures (synchronize permanently false — T2.5):
 * - DEC-003: ensure legacy `applications.extras` column.
 * - proxy6-migration DEC-002 / CON-008: drop retired settings proxy columns.
 * - durable-bls-workflow DEC-012 / DEC-020: ensure BLS indexes + partial unique
 *   for one active workflow per application. Does **not** drop `portal_autofill_runs`.
 * - roles-and-applications T12: drop legacy `applications.applicants` jsonb;
 *   unique partial index for at most one `superadmin`; ensure non-unique
 *   `applications.client_id` (DEC-PF-011 1:N); ensure `users.balance`.
 *   No applicants passport backfill (column removed).
 * - APF-TASK-002 / DEC-005: additive portal-form columns on clients +
 *   applications (nullable; null = not collected).
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
    await this.ensureApplicantPortalFormSchema();
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

    // DEC-PF-011: 1 Client : N Applications. Initial migration creates
    // non-unique IDX_19b187…; DROP+CREATE heals local DBs that still have
    // the old unique index under either name.
    await this.dataSource.query(`
      DROP INDEX IF EXISTS uq_applications_client_id
    `);
    await this.dataSource.query(`
      DROP INDEX IF EXISTS idx_applications_client_id
    `);
    await this.dataSource.query(`
      DROP INDEX IF EXISTS "IDX_19b187ccdbeb753c44a3a0be30"
    `);
    await this.dataSource.query(`
      CREATE INDEX IF NOT EXISTS "IDX_19b187ccdbeb753c44a3a0be30"
      ON applications (client_id)
    `);
    this.logger.log(
      'Schema ensure: applications.client_id non-unique index OK (DEC-PF-011)',
    );

    await this.dataSource.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS balance NUMERIC(14, 2) DEFAULT 0
    `);
    this.logger.log('Schema ensure: users.balance column OK');
  }

  /**
   * APF-TASK-002 / DEC-005: portal-form happy-path + conditionals jsonb.
   * Additive nullable only — no invented defaults. Mirrors API SchemaBootstrap.
   */
  private async ensureApplicantPortalFormSchema(): Promise<void> {
    await this.dataSource.query(`
      ALTER TABLE applications
      ADD COLUMN IF NOT EXISTS visa_sub_type VARCHAR(120) NULL
    `);

    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS home_address_line2 TEXT NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS home_country VARCHAR(120) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS home_city VARCHAR(120) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS home_postal_code VARCHAR(40) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS employer_name VARCHAR(200) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS employer_phone VARCHAR(80) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS employer_address TEXT NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS occupation VARCHAR(120) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS previous_finger_print_status VARCHAR(40) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS previous_finger_print_date VARCHAR(20) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS bls_inviting_authority VARCHAR(40) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_authority_name VARCHAR(200) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_country VARCHAR(120) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_city VARCHAR(120) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_zip_code VARCHAR(40) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_address TEXT NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_email VARCHAR(200) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_contact_no VARCHAR(80) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_fax_no VARCHAR(80) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_contact_name VARCHAR(120) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_contact_surname VARCHAR(120) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_contact_country VARCHAR(120) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_contact_city VARCHAR(120) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_contact_zip_code VARCHAR(40) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_contact_address TEXT NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_contact_contact_no VARCHAR(80) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_contact_email VARCHAR(200) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS inviting_contact_fax_no VARCHAR(80) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS cost_covered_by VARCHAR(120) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS means_of_support VARCHAR(120) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS member_state_second_destination VARCHAR(120) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS portal_form_conditionals_json JSONB NULL
    `);

    this.logger.log(
      'Schema ensure: applications.visa_sub_type + clients portal-form columns OK',
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
      ALTER TABLE bls_workflow_tasks
      ADD COLUMN IF NOT EXISTS portal_status VARCHAR(64) NULL
    `);
    await this.dataSource.query(`
      ALTER TABLE bls_workflow_tasks
      ADD COLUMN IF NOT EXISTS portal_checkpoint_json JSONB NULL
    `);
    this.logger.log(
      'Schema ensure: bls_workflow_tasks portal_status + portal_checkpoint_json OK',
    );

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
