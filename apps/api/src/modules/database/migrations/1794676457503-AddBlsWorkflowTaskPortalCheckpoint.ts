import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MA-TASK-001 / DEC-003: additive portal checkpoint columns on bls_workflow_tasks.
 * Null = resume-from-scrape compatible. Does not store field values or secrets.
 */
export class AddBlsWorkflowTaskPortalCheckpoint1794676457503
  implements MigrationInterface
{
  name = 'AddBlsWorkflowTaskPortalCheckpoint1794676457503';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "bls_workflow_tasks"
      ADD COLUMN IF NOT EXISTS "portal_status" character varying(64)
    `);
    await queryRunner.query(`
      ALTER TABLE "bls_workflow_tasks"
      ADD COLUMN IF NOT EXISTS "portal_checkpoint_json" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "bls_workflow_tasks"
      DROP COLUMN IF EXISTS "portal_checkpoint_json"
    `);
    await queryRunner.query(`
      ALTER TABLE "bls_workflow_tasks"
      DROP COLUMN IF EXISTS "portal_status"
    `);
  }
}
